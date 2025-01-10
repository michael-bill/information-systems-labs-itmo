package com.michael.app.service.file;

import com.michael.app.entity.UploadFileHistory;
import com.michael.app.repository.UploadFileHistoryRepository;
import com.michael.app.service.core.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UploadFileHistoryService {

    private final UploadFileHistoryRepository uploadFileHistoryRepository;
    private final NotificationService notificationService;

    public Page<UploadFileHistory> getAll(Pageable pageable) {
        return uploadFileHistoryRepository.findAll(pageable);
    }

    public UploadFileHistory save(UploadFileHistory uploadFileHistory) {
        UploadFileHistory res = uploadFileHistoryRepository.save(uploadFileHistory);
        notificationService.notifyAboutCreateUploadFileHistory(res);
        return res;
    }

}
