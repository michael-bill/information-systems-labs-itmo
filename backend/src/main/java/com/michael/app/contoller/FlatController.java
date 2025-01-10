package com.michael.app.contoller;

import com.michael.app.dto.FlatDto;
import com.michael.app.dto.MessageDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.User;
import com.michael.app.service.core.FlatService;
import com.michael.app.service.file.FlatUploadFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/flat")
@RequiredArgsConstructor
@Tag(name = "Работа с объектами Flat")
public class FlatController {

    private final FlatService flatService;
    private final FlatUploadFileService flatUploadFileService;

    @GetMapping("/get/{id}")
    @Operation(summary = "Получение Flat по id")
    public Flat getById(
            @PathVariable("id") Long id
    ) {
        return flatService.getById(id);
    }

    @GetMapping("/get-all")
    @Operation(summary = "Получение всего списка Flat")
    public Page<Flat> getAll(
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
        return flatService.getAll(pageable);
    }

    @PostMapping("/get-by-filter")
    @Operation(summary = "Получение списка Flat по фильтру")
    public Page<Flat> getByFilter(
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
        return flatService.getByFilter(filterParams, pageable);
    }

    @PostMapping("/create")
    @Operation(summary = "Создание Flat по всем его параметрам")
    public Flat createFlat(
            @RequestBody FlatDto flat,
            @AuthenticationPrincipal User user
    ) {
        return flatService.create(flat, user);
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Обновить Flat по id и его параметрам")
    public Flat updateFlat(
            @PathVariable("id") Long id,
            @RequestBody FlatDto flat,
            @AuthenticationPrincipal User user
    ) {
        return flatService.updateById(id, flat, user);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Удалить Flat по id")
    public void deleteFlat(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User user
            ) {
        flatService.deleteById(id, user);
    }

    @GetMapping("get-flat-with-min-number-of-bathrooms")
    @Operation(summary = "Получение Flat с минимальным количеством bathrooms")
    public Flat getFlatWithMinNumberOfBathrooms() {
        return flatService.getFlatWithMinNumberOfBathrooms();
    }

    @GetMapping("get-flat-with-max-coordinates")
    @Operation(summary = "Получение Flat с максимальными координатами")
    public Flat getFlatWithMaxCoordinates() {
        return flatService.getFlatWithMaxCoordinates();
    }

    @GetMapping("get-flats-by-substring-of-name")
    @Operation(summary = "Получение Flats по префику имени")
    public List<Flat> getFlatsBySubstringOfName(
            @RequestParam("prefix") String prefix
    ) {
        return flatService.getFlatsBySubstringOfName(prefix);
    }

    @GetMapping("get-flats-ordered-by-time-to-metro-on-foot")
    @Operation(summary = "Получение отсортированного списка Flats по времени до метро пешком")
    public List<Flat> getFlatsOrderedByTimeToMetroOnFoot() {
        return flatService.getFlatsOrderedByTimeToMetroOnFoot();
    }

    @GetMapping("choose-more-cheaper-flat-by-ids")
    @Operation(summary = "Выбрать более дешевый Flat по id")
    public Flat chooseMoreCheaperFlatByIds(
            @RequestParam("id1") Long id1,
            @RequestParam("id2") Long id2
    ) {
        return flatService.chooseMoreCheaperFlatByIds(id1, id2);
    }

    @PostMapping(value = "/upload/json", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Массовая загрузка Flat из json файла")
    public MessageDto uploadFromFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) {
        return flatUploadFileService.uploadFromJsonFile(user, file);
    }
}
