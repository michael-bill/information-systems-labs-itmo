package com.michael.app.contoller;

import com.michael.app.dto.HouseDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import com.michael.app.entity.User;
import com.michael.app.service.HouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/house")
@RequiredArgsConstructor
@Tag(name = "Работа с объектами House")
public class HouseController {

    private final HouseService houseService;

    @GetMapping("/get/{id}")
    @Operation(summary = "Получение House по id")
    public House getById(@PathVariable("id") Long id) {
        return houseService.getById(id);
    }

    @GetMapping("/get-all")
    @Operation(summary = "Получение всего списка House")
    public List<House> getAll() {
        return houseService.getAll();
    }

    @GetMapping("/get-all-flats/{id}")
    @Operation(summary = "Получение всех Flats по id House")
    public List<Flat> getAllFlatsByHouseId(@PathVariable("id") Long id) {
        return houseService.getAllFlatsByHouseId(id);
    }

    @PostMapping("/create")
    @Operation(summary = "Создание House по всем его параметрам")
    public House createFlat(
            @RequestBody HouseDto house,
            @AuthenticationPrincipal User user
    ) {
        return houseService.create(house, user);
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Обновить House по id и его параметрам")
    public House updateHouse(
            @PathVariable("id") Long id,
            @RequestBody HouseDto house,
            @AuthenticationPrincipal User user
    ) {
        return houseService.updateById(id, house, user);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Удалить House по id. " +
            "Внимание! При удалении House, связанные с ним Flat'ы тоже удаляются! " +
            "Также ещё один нюанс: если House привязан с каким-то Flat, на которые у " +
            "вас нет прав, операция не выполнится")
    public void deleteHouse(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User user
    ) {
        houseService.deleteById(id, user);
    }
}
