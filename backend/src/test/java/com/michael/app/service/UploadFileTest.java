package com.michael.app.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import com.michael.app.entity.UploadFileHistory;
import com.michael.app.entity.User;
import com.michael.app.exception.UploadFileException;
import com.michael.app.repository.FlatRepository;
import com.michael.app.repository.UploadFileHistoryRepository;
import com.michael.app.repository.UserRepository;
import com.michael.app.service.core.NotificationService;
import com.michael.app.service.file.FlatFileService;
import com.michael.app.service.file.MinioService;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;

@SpringBootTest
@ActiveProfiles("test")
public class UploadFileTest {

    @Autowired
    private FlatFileService flatFileService;
    @Autowired
    private UploadFileHistoryRepository uploadFileHistoryRepository;
    @Autowired
    private FlatRepository flatRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @SpyBean
    private MinioService minioService;
    @MockBean
    private NotificationService notificationService;

    private User user;

    @BeforeEach
    public void prepare() {
        // чистим бд перед тестами
        cleanDatabase();
        // Создаем тестового пользователя
        jdbcTemplate.execute("insert into users (id, username, password, role) " +
                "values (1, 'test_user', 'test_password', 'ROLE_ADMIN')");
        // Создаем тестовый дом
        jdbcTemplate.execute("insert into house (id, name, year, number_of_flats_on_floor, user_id) " +
                "values (1, 'test_house', 1, 1, 1)");
        user = userRepository.findById(1L).orElseThrow();
    }

    @Test
    public void testUploadFile() throws Exception {
        String fileContent = getFileContent("json/flats_1000.json");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "flats_1000.json",
                "application/json",
                fileContent.getBytes()
        );

        // Грузим
        UploadFileHistory res = flatFileService.uploadFromJsonFile(user, file);

        // Проверяем статус загрузки
        assertEquals(res.getStatus(), UploadFileHistory.Status.SUCCESS);

        // Проверяем количество загруженных flat в бд
        assertEquals(1000L, flatRepository.count());

        // Проверяем, что запись сохранилась в бд с историей
        assertTrue(uploadFileHistoryRepository.existsByIdAndStatus(res.getId(), UploadFileHistory.Status.SUCCESS));

        // Проверяем, что файл существует в minio
        assertTrue(minioService.getFileInfo(String.valueOf(res.getId())).isPresent());

        // Проверяем, что контент файла и контент в minio идентичен
        String minioFileContent = new String(
                minioService.getFile(String.valueOf(res.getId())).readAllBytes(),
                StandardCharsets.UTF_8
        );
        assertEquals(fileContent, minioFileContent);
        minioService.deleteFile(String.valueOf(res.getId()));
    }

    @Test
    public void testUploadFileWithDatabaseError() throws IOException {
        String fileContent = getFileContent("json/flats_1000.json");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "flats_1000.json",
                "application/json",
                fileContent.getBytes()
        );

        // Иниуиирцем ошибку бд, например удаляем тестовый house, с которым связаны flat в json
        jdbcTemplate.execute("delete from house where id = 1");

        // Грузим и проверяем, что метод выбросил исключение
        UploadFileException ex = assertThrows(
                UploadFileException.class,
                () -> flatFileService.uploadFromJsonFile(user, file)
        );

        UploadFileHistory res = ex.getUploadFileHistory();

        // Проверяем, что статус загрузки - FAILURE
        assertEquals(res.getStatus(), UploadFileHistory.Status.FAILURE);

        // Проверяем сообщение ошибки
        assertTrue(res.getErrorMessage().contains("неверно указан идентификатор House"));

        // Проверяем, что количество flat в бд не изменилось
        assertEquals(0L, flatRepository.count());

        // Проверяем, что файл не сохранился в minio
        assertTrue(minioService.getFileInfo(String.valueOf(res.getId())).isEmpty());
    }

    @Test
    public void testUploadFileWithMinioError() throws Exception {
        String fileContent = getFileContent("json/flats_1000.json");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "flats_1000.json",
                "application/json",
                fileContent.getBytes()
        );

        // Инициируем ошибку minio
        doThrow(new RuntimeException("О нет с minio что-то случилось"))
                .when(minioService).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());

        // Грузим и проверяем, что метод выбросил исключение
        UploadFileException ex = assertThrows(
                UploadFileException.class,
                () -> flatFileService.uploadFromJsonFile(user, file)
        );

        UploadFileHistory res = ex.getUploadFileHistory();

        // Проверяем, что статус загрузки - FAILURE
        assertEquals(res.getStatus(), UploadFileHistory.Status.FAILURE);

        // Проверяем сообщение ошибки
        assertTrue(res.getErrorMessage().contains("О нет с minio что-то случилось"));

        // Проверяем, что количество flat в бд не изменилось
        assertEquals(0L, flatRepository.count());

        // Проверяем, что файл не сохранился в minio
        assertTrue(minioService.getFileInfo(String.valueOf(res.getId())).isEmpty());
    }

    @Test
    public void testUploadWithRuntimeError() throws IOException {
        // второй объект в файле содержит невалидные данные и сломает загрузку
        String notValidFileContent = """
                [
                  {
                    "name": "CIfiFZDWIK",
                    "coordinates": {
                      "x": 342.98,
                      "y": 796.34
                    },
                    "creationDate": "2023-11-11T00:00:00.000Z",
                    "area": 149.39,
                    "price": 665494.76,
                    "balcony": true,
                    "timeToMetroOnFoot": 7,
                    "numberOfRooms": 3,
                    "numberOfBathrooms": 5,
                    "timeToMetroByTransport": 8,
                    "view": "STREET",
                    "houseId": 1
                  },
                  {
                    "name": "CIfiFZDWIK",
                    "coordinates": {
                      "x": 342.98,
                      "y": 796.34
                    },
                    "creationDate": "2023-11-11T00:00:00.000Z",
                    "area": 149.39,
                    "price": 665494.76,
                    "balcony": true,
                    "timeToMetroOnFoot": 7,
                    "numberOfRooms": -1,
                    "numberOfBathrooms": 5,
                    "timeToMetroByTransport": 8,
                    "view": "STREET",
                    "houseId": 1
                  }
                ]
                """;
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "flats_1000.json",
                "application/json",
                notValidFileContent.getBytes()
        );

        // Грузим и проверяем, что метод выбросил исключение
        UploadFileException ex = assertThrows(
                UploadFileException.class,
                () -> flatFileService.uploadFromJsonFile(user, file)
        );

        UploadFileHistory res = ex.getUploadFileHistory();

        // Проверяем, что статус загрузки - FAILURE
        assertEquals(res.getStatus(), UploadFileHistory.Status.FAILURE);

        // Проверяем сообщение ошибки
        assertTrue(res.getErrorMessage().contains("Поле numberOfRooms должно быть больше 0"));

        // Проверяем, что количество flat в бд не изменилось
        assertEquals(0L, flatRepository.count());

        // Проверяем, что файл не сохранился в minio
        assertTrue(minioService.getFileInfo(String.valueOf(res.getId())).isEmpty());
    }

    private String getFileContent(String fileName) throws IOException {
        Resource resource = new ClassPathResource(fileName);
        return IOUtils.toString(resource.getInputStream(), StandardCharsets.UTF_8);
    }

    @AfterEach
    public void clean() {
        cleanDatabase();
    }

    private void cleanDatabase() {
        jdbcTemplate.execute("delete from upload_file_history");
        jdbcTemplate.execute("delete from flat");
        jdbcTemplate.execute("delete from house");
        jdbcTemplate.execute("delete from users");
    }
}
