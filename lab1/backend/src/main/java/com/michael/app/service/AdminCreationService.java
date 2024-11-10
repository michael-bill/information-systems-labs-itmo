package com.michael.app.service;

import com.michael.app.entity.AdminCreationRequest;
import com.michael.app.entity.User;
import com.michael.app.exception.NoRulesException;
import com.michael.app.repository.AdminCreationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminCreationService {

    private final AdminCreationRequestRepository adminCreationRequestRepository;
    private final UserService userService;

    public Page<AdminCreationRequest> getAll(Pageable pageable) {
        return adminCreationRequestRepository.findAll(pageable);
    }

    public Page<AdminCreationRequest> getAllByUser(User user, Pageable pageable) {
        return adminCreationRequestRepository.findAllByUser(user, pageable);
    }

    public AdminCreationRequest getRequestById(Long id) {
        return adminCreationRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заявки с таким id не найдено"));
    }

    public void createRequest(User user) {
        var request = AdminCreationRequest.builder()
                .user(user)
                .status(AdminCreationRequest.Status.SENT)
                .build();
        var requestWithId = adminCreationRequestRepository.save(request);
        if (userService.getAdminCount() == 0) {
            user.setRole(User.Role.ROLE_ADMIN);
            approveRequest(user, requestWithId.getId());
        }
    }

    @Transactional
    public void approveRequest(User approvedBy, Long requestId) {
        if (approvedBy.getRole() != User.Role.ROLE_ADMIN) {
            throw new NoRulesException("Пользователь не может одобрять заявки, это действие только для администратора");
        }
        AdminCreationRequest request = adminCreationRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Заявки с таким id не найдено"));
        request.setStatus(AdminCreationRequest.Status.APPROVED);
        request.setStatusChangedBy(approvedBy);
        adminCreationRequestRepository.save(request);
        User user = request.getUser();
        user.setRole(User.Role.ROLE_ADMIN);
        userService.save(user);
    }

    public void rejectRequest(User rejectedBy, Long requestId) {
        if (rejectedBy.getRole() != User.Role.ROLE_ADMIN) {
            throw new NoRulesException("Пользователь не может одобрять заявки, это действие только для администратора");
        }
        AdminCreationRequest request = adminCreationRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Заявки с таким id не найдено"));
        request.setStatus(AdminCreationRequest.Status.REJECTED);
        request.setStatusChangedBy(rejectedBy);
        adminCreationRequestRepository.save(request);
    }
}
