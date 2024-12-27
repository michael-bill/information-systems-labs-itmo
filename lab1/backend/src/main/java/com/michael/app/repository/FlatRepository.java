package com.michael.app.repository;

import java.util.List;
import java.util.Optional;

import com.michael.app.entity.Flat;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
    import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
@Repository
@Transactional(isolation = Isolation.READ_COMMITTED)
public interface FlatRepository extends JpaRepository<Flat, Long>, JpaSpecificationExecutor<Flat> {
    @Query(value = "select * from get_flat_with_min_number_of_bathrooms_func()", nativeQuery = true)
    Optional<Flat> getFlatWithMinNumberOfBathrooms();

    @Query(value = "select * from get_flat_with_max_coordinates_func()", nativeQuery = true)
    Optional<Flat> getFlatWithMaxCoordinates();

    @Query(value = "select * from get_flats_by_substr_of_name_func(:prefix)", nativeQuery = true)
    List<Flat> getFlatsBySubstringOfName(@Param("prefix") String prefix);

    @Query(value = "select * from flat order by time_to_metro_on_foot asc", nativeQuery = true)
    List<Flat> getFlatsOrderedByTimeToMetroOnFoot();

    @Query(value = "select * from choose_more_cheaper_flat_by_ids(:id1, :id2)", nativeQuery = true)
    Optional<Flat> chooseMoreCheaperFlatByIds(@Param("id1") Long id1, @Param("id2") Long id2);

    List<Flat> findByHouseId(Long houseId);
}
