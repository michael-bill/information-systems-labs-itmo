package com.michael.app.contoller;

import com.michael.app.dto.FlatDto;
import com.michael.app.entity.Flat;
import com.michael.app.service.FlatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
    public Flat getById(@PathVariable("id") Long id) {
        return flatService.getById(id);
    }

    @GetMapping("/get-all")
    @Operation(summary = "Получение всего списка Flat")
    public List<Flat> getAll() {
        return flatService.getAll();
    }

    @PostMapping("/create")
    @Operation(summary = "Создание Flat по всем его параметрам")
    public Flat createFlat(@RequestBody FlatDto flat) {
        return flatService.create(flat);
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Обновить Flat по id и его параметрам")
    public Flat updateFlat(@PathVariable("id") Long id, @RequestBody FlatDto flat) {
        return flatService.updateById(id, flat);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Удалить Flat по id")
    public void deleteFlat(@PathVariable("id") Long id) {
        flatService.deleteById(id);
    }
}
