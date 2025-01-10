package com.michael.app.contoller;

import java.util.Map;

import com.michael.app.entity.UploadFileHistory;
import com.michael.app.service.file.UploadFileHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping("/get-by-filter")
    @Operation(summary = "Получение списка UploadFileHistory по фильтру")
    public Page<UploadFileHistory> getByFilter(
            @RequestBody
            Map<String, Object> filterParams,
            @Parameter(description = "Номер страницы (начинается с 0)")
            @RequestParam(defaultValue = "0")
            int page,
            @Parameter(description = "Количество элементов на странице")
            @RequestParam(defaultValue = "10")
            int size,
            @Parameter(description = "Параметры сортировки в формате 'поле,порядок'")
            @RequestParam(defaultValue = "id,asc")
            String sort
    ) {
        var sortValues = sort.split(",");
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.fromString(sortValues[1]), sortValues[0]);
        return uploadFileHistoryService.getByFilter(filterParams, pageable);
    }
}
