package com.michael.app.contoller;

import com.michael.app.dto.HouseDto;
import com.michael.app.entity.House;
import com.michael.app.service.HouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/house")
@RequiredArgsConstructor
@Tag(name = "Работа с объектами House")
public class HouseController {
    private final HouseService houseService;
    @PostMapping("/create")
    @Operation(summary = "Создание House по всем его параметрам")
    public House createFlat(@RequestBody HouseDto house) {
        return houseService.createHouse(house);
    }
}
