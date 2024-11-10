package com.michael.app.repository;

import java.util.Optional;

import com.michael.app.entity.AdminCreationRequest;
import com.michael.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminCreationRequestRepository extends JpaRepository<AdminCreationRequest, Long> {
    Page<AdminCreationRequest> findAllByUser(User user, Pageable pageable);
}
