package com.michael.app.contoller;

import com.michael.app.entity.Flat;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/example/ws/topic")
@Tag(name = "Информация о работе с WebSocket (Заглушка, служит для документации, использовать без example)")
public class WebSocketInfoController {

    @GetMapping("/updates/flat")
    @Operation(summary = "Получить обновленный Flat")
    public Flat getFlatUpdates() {
        return null;
    }

    @GetMapping("/creates/flat")
    @Operation(summary = "Получить созданный Flat")
    public Flat getFlatCreates() {
        return null;
    }

    @GetMapping("/deletes/flat")
    @Operation(summary = "Получить id удалённого Flat")
    public Flat getFlatDeletes() {
        return null;
    }

    @GetMapping("/updates/house")
    @Operation(summary = "Получить обновленный House")
    public Flat getHouseUpdates() {
        return null;
    }

    @GetMapping("/creates/house")
    @Operation(summary = "Получить созданный House")
    public Flat getHouseCreates() {
        return null;
    }

    @GetMapping("/deletes/house")
    @Operation(summary = "Получить id удалённого House")
    public Flat getHouseDeletes() {
        return null;
    }
}
