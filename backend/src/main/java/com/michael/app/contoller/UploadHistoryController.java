package com.michael.app.contoller;

import com.michael.app.entity.UploadFileHistory;
import com.michael.app.service.file.UploadFileHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/upload-history")
@RequiredArgsConstructor
@Tag(name = "История загрузок файлов")
public class UploadHistoryController {

    private final UploadFileHistoryService uploadFileHistoryService;

    @Operation(summary = "Получение всех историй загрузок файлов")
    @GetMapping("/get-all")
    public Page<UploadFileHistory> getAll(
            @Parameter(description = "Номер страницы (начинается с 0)")
            @RequestParam(defaultValue = "0")
            Integer page,
            @Parameter(description = "Количество элементов на странице")
            @RequestParam(defaultValue = "10")
            Integer size
    ) {
        return uploadFileHistoryService.getAll(PageRequest.of(page, size));
    }
}
