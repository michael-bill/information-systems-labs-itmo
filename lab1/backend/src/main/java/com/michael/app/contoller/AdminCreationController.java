package com.michael.app.contoller;

import com.michael.app.entity.AdminCreationRequest;
import com.michael.app.entity.User;
import com.michael.app.service.AdminCreationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin-creation")
@Tag(name = "Работа с созданием администратора")
public class AdminCreationController {

    private final AdminCreationService adminCreationService;

    @GetMapping("/get-all-requests")
    @Operation(summary = "Получение списка заявок")
    public Page<AdminCreationRequest> getAll(
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
        return adminCreationService.getAll(pageable);
    }

    @GetMapping("get-my-requests")
    @Operation(summary = "Получить мои заявки")
    public Page<AdminCreationRequest> getMyRequests(
            @Parameter(description = "Номер страницы (начинается с 0)")
            @RequestParam(defaultValue = "0")
            int page,
            @Parameter(description = "Количество элементов на странице")
            @RequestParam(defaultValue = "10")
            int size,
            @Parameter(description = "Параметры сортировки в формате 'поле,порядок'")
            @RequestParam(defaultValue = "id,asc")
            String sort,
            @AuthenticationPrincipal User user
    ) {
        var sortValues = sort.split(",");
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.fromString(sortValues[1]), sortValues[0]);
        return adminCreationService.getAllByUser(user, pageable);
    }

    @GetMapping("/get-request/{id}")
    @Operation(summary = "Получить запрос на создание админа по id")
    public AdminCreationRequest getRequestById(
            @PathVariable("id") Long id
    ) {
        return adminCreationService.getRequestById(id);
    }

    @GetMapping("/create-request")
    @Operation(summary = "Создать запрос на создание админа")
    public void createRequest(
            @AuthenticationPrincipal User user
    ) {
        adminCreationService.createRequest(user);
    }

    @GetMapping("approve-request")
    @Operation(summary = "Одобрить запрос на создание админа")
    public void approveRequest(
            @AuthenticationPrincipal User user,
            @RequestParam Long requestId
    ) {
        adminCreationService.approveRequest(user, requestId);
    }

    @GetMapping("reject-request")
    @Operation(summary = "Отклонить запрос на создание админа")
    public void rejectRequest(
            @AuthenticationPrincipal User user,
            @RequestParam Long requestId
    ) {
        adminCreationService.rejectRequest(user, requestId);
    }
}
