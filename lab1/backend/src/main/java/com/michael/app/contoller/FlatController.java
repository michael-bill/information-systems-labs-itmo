package com.michael.app.contoller;

import com.michael.app.dto.FlatDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.User;
import com.michael.app.service.FlatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/flat")
@RequiredArgsConstructor
@Tag(name = "Работа с объектами Flat")
public class FlatController {

    private final FlatService flatService;

    @GetMapping("/get/{id}")
    @Operation(summary = "Получение Flat по id")
    public Flat getById(
            @PathVariable("id") Long id
    ) {
        return flatService.getById(id);
    }

    @GetMapping("/get-all")
    @Operation(summary = "Получение всего списка Flat")
    public List<Flat> getAll() {
        return flatService.getAll();
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

    @GetMapping("get-flats-sorted-by-distance-from-subway")
    @Operation(summary = "Получение отсортированного списка Flats по расстоянию от метро")
    public List<Flat> getFlatsBySubstringOfName(
            @RequestParam("metroX") Long metroX,
            @RequestParam("metroY") Long metroY
    ) {
        return flatService.getFlatsSortedByDistanceFromSubway(metroX, metroY);
    }

    @GetMapping("choose-more-cheaper-flat-by-ids")
    @Operation(summary = "Выбрать более дешевый Flat по id")
    public Flat chooseMoreCheaperFlatByIds(
            @RequestParam("id1") Long id1,
            @RequestParam("id2") Long id2
    ) {
        return flatService.chooseMoreCheaperFlatByIds(id1, id2);
    }
}
