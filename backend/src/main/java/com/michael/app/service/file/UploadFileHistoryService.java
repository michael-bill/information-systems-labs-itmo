package com.michael.app.service.file;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.michael.app.entity.UploadFileHistory;
import com.michael.app.repository.UploadFileHistoryRepository;
import com.michael.app.service.core.NotificationService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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

    public Page<UploadFileHistory> getByFilter(Map<String, Object> filterParams, Pageable pageable) {
        Specification<UploadFileHistory> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            filterParams.forEach((key, value) -> {
                try {
                    String valueAsString = value.toString();
                    predicates.add(criteriaBuilder.like(
                            criteriaBuilder.lower(root.get(key).as(String.class)),
                            "%" + valueAsString.toLowerCase() + "%"));
                } catch (Exception ignored) { }
            });
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        return uploadFileHistoryRepository.findAll(specification, pageable);
    }

}
