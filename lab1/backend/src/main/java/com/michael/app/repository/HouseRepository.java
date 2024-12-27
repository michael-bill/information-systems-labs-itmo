package com.michael.app.repository;

import com.michael.app.entity.House;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional(isolation = Isolation.READ_COMMITTED)
public interface HouseRepository extends JpaRepository<House, Long>, JpaSpecificationExecutor<House> {
    @Query(value = "select exists(select 1 from house where id = :id)", nativeQuery = true)
    boolean existsById(@Param("id") @NonNull Long id);
}
