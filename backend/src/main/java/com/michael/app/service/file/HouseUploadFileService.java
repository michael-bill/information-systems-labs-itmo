package com.michael.app.service.file;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import com.michael.app.dto.MessageDto;
import com.michael.app.entity.House;
import com.michael.app.entity.User;
import com.michael.app.exception.UploadFileException;
import com.michael.app.repository.HouseRepository;
import com.michael.app.service.core.NotificationService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class HouseUploadFileService {

    private final HouseRepository houseRepository;
    private final NotificationService notificationService;

    private final ObjectMapper objectMapper;
    private final YAMLMapper yamlMapper;
    private final XmlMapper xmlMapper;
    private final CsvMapper csvMapper;

    @Transactional
    public MessageDto uploadFromJsonFile(User user, MultipartFile file) {
        if (!Objects.requireNonNull(file.getOriginalFilename()).endsWith(".json")) {
            throw new IllegalArgumentException("Файл должен быть в формате json");
        }
        try (
            InputStream inputStream = file.getInputStream();
            JsonParser jsonParser = objectMapper.getFactory().createParser(inputStream)
        ) {
            if (jsonParser.nextToken() != JsonToken.START_ARRAY) {
                throw new IllegalArgumentException("Ожидался массив json объектов");
            }

            long counter = 0;

            List<House> chunk = new ArrayList<>();
            int chunkSize = 1000;

            while (jsonParser.nextToken() != JsonToken.END_ARRAY) {

                House house = objectMapper.readValue(jsonParser, House.class);
                house.setUser(user);

                chunk.add(house);
                counter++;

                if (chunk.size() == chunkSize) {
                    houseRepository.saveAll(chunk);
                    chunk.clear();
                }
            }

            if (!chunk.isEmpty()) {
                houseRepository.saveAll(chunk);
            }
            return new MessageDto("Успешно загружено " + counter + " объектов");
        } catch (ConstraintViolationException e) {
            throw new UploadFileException(
                    "Произошла ошибка при загрузке файла, причина: " +
                    e.getConstraintViolations().stream()
                            .map(ConstraintViolation::getMessage)
                            .collect(Collectors.joining(", "))
            );
        } catch (JsonMappingException e) {
            throw new UploadFileException("Произошла ошибка при загрузке файла, причина: json файл неверной структуры");
        } catch (Exception e) {
            throw new UploadFileException("Произошла ошибка при загрузке файла" + e.getMessage());
        }
    }
}
