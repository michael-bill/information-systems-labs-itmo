package com.michael.app.service.core;

import com.michael.app.entity.AdminCreationRequest;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyAboutChange(Flat flat) {
        messagingTemplate.convertAndSend("/topic/updates/flat", flat);
    }

    public void notifyAboutChange(House house) {
        messagingTemplate.convertAndSend("/topic/updates/house", house);
    }

    public void notifyAboutCreate(Flat flat) {
        messagingTemplate.convertAndSend("/topic/creates/flat", flat);
    }

    public void notifyAboutCreate(House house) {
        messagingTemplate.convertAndSend("/topic/creates/house", house);
    }

    public void notifyAboutDeleteFlat(Long flatId) {
        messagingTemplate.convertAndSend("/topic/deletes/flat", flatId);
    }

    public void notifyAboutDeleteHouse(Long houseId) {
        messagingTemplate.convertAndSend("/topic/deletes/house", houseId);
    }

    public void notifyAboutUpdateRequestStatus(AdminCreationRequest adminCreationRequest) {
        messagingTemplate.convertAndSend("/topic/updates/admin-creation-request", adminCreationRequest);
    }

    public void notifyAboutCreateRequest(AdminCreationRequest adminCreationRequest) {
        messagingTemplate.convertAndSend("/topic/creates/admin-creation-request", adminCreationRequest);
    }
}
