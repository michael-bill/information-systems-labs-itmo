package com.michael.app.service.file;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.michael.app.dto.FlatDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import com.michael.app.entity.UploadFileHistory;
import com.michael.app.entity.User;
import com.michael.app.exception.UploadFileException;
import com.michael.app.repository.FlatRepository;
import com.michael.app.service.core.NotificationService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FlatUploadFileService {

    private final FlatRepository flatRepository;
    private final UploadFileHistoryService uploadFileHistoryService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Transactional
    public UploadFileHistory uploadFromJsonFile(User user, MultipartFile file) {

        UploadFileHistory failureUploadFileHistory = UploadFileHistory.builder()
                .fileName(file.getOriginalFilename())
                .entityName(Flat.class.getSimpleName())
                .uploaded(0L)
                .uploadDate(LocalDateTime.now())
                .status(UploadFileHistory.Status.FAILURE)
                .user(user)
                .build();

        if (!Objects.requireNonNull(file.getOriginalFilename()).endsWith(".json")) {
            String message = "Файл должен быть в формате json";
            failureUploadFileHistory.setErrorMessage(message);
            throw new UploadFileException(message, failureUploadFileHistory);
        }

        try (
                InputStream inputStream = file.getInputStream();
                JsonParser jsonParser = objectMapper.getFactory().createParser(inputStream)
        ) {
            if (jsonParser.nextToken() != JsonToken.START_ARRAY) {
                throw new IllegalArgumentException("Ожидался массив объектов");
            }

            long counter = 0;

            List<Flat> chunk = new ArrayList<>();
            int chunkSize = 1000;

            while (jsonParser.nextToken() != JsonToken.END_ARRAY) {

                FlatDto flatDto = objectMapper.readValue(jsonParser, FlatDto.class);
                Flat flat = FlatDto.convertFromDto(
                        flatDto,
                        House.builder().id(flatDto.getHouseId()).build(),
                        user
                );
                chunk.add(flat);
                counter++;

                if (chunk.size() == chunkSize) {
                    flatRepository.saveAll(chunk);
                    chunk.forEach(notificationService::notifyAboutCreate);
                    chunk.clear();
                }
            }

            if (!chunk.isEmpty()) {
                flatRepository.saveAll(chunk);
                chunk.forEach(notificationService::notifyAboutCreate);
            }

            UploadFileHistory successUploadFileHistory = UploadFileHistory.builder()
                    .fileName(file.getOriginalFilename())
                    .entityName(Flat.class.getSimpleName())
                    .uploaded(counter)
                    .uploadDate(LocalDateTime.now())
                    .status(UploadFileHistory.Status.SUCCESS)
                    .user(user)
                    .build();

            uploadFileHistoryService.save(successUploadFileHistory);

            return successUploadFileHistory;
        } catch (ConstraintViolationException e) {

            String message = "Произошла ошибка при загрузке файла, причина: " +
                    e.getConstraintViolations().stream()
                            .map(ConstraintViolation::getMessage)
                            .collect(Collectors.joining(", "));

            failureUploadFileHistory.setErrorMessage(message);
            throw new UploadFileException(message, failureUploadFileHistory);
        } catch (JsonMappingException | IllegalArgumentException e) {

            String message = "Произошла ошибка при загрузке файла, причина: " +
                    "json файл неверной структуры: " + e.getMessage();

            failureUploadFileHistory.setErrorMessage(message);
            throw new UploadFileException(message, failureUploadFileHistory);
        } catch (Exception e) {

            String message = "Произошла ошибка при загрузке файла: " + e.getMessage();

            if (e.getMessage().contains("violates foreign key constraint")) {
                message = "Произошла ошибка при загрузке файла, причина: " +
                        "неверно указан идентификатор дома";
            }

            failureUploadFileHistory.setErrorMessage(message);
            throw new UploadFileException(message, failureUploadFileHistory);
        }
    }
}
