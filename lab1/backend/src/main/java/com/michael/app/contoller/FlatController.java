package com.michael.app.contoller;

import com.michael.app.dto.FlatDto;
import com.michael.app.entity.Flat;
import com.michael.app.service.FlatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/flat")
@RequiredArgsConstructor
@Tag(name = "Работа с объектами Flat")
public class FlatController {

    private final FlatService flatService;

    @GetMapping("/get/{id}")
    public Flat getById(@PathVariable("id") Long id) {
        return flatService.getById(id);
    }

    @PostMapping("/create")
    @Operation(summary = "Создание Flat по всем его параметрам")
    public Flat createFlat(@RequestBody FlatDto flat) {
        return flatService.createFlat(flat);
    }
}
