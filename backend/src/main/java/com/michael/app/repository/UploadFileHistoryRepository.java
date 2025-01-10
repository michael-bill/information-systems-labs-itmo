package com.michael.app.repository;

import com.michael.app.entity.UploadFileHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadFileHistoryRepository extends JpaRepository<UploadFileHistory, Long>, JpaSpecificationExecutor<UploadFileHistory> {
}
