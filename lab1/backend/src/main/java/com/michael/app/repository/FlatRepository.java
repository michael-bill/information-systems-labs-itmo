package com.michael.app.repository;

import java.util.List;
import java.util.Optional;

import com.michael.app.entity.Flat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FlatRepository extends JpaRepository<Flat, Long> {
    @Query(value = "select * from get_flat_with_min_number_of_bathrooms_func()", nativeQuery = true)
    Optional<Flat> getFlatWithMinNumberOfBathrooms();

    @Query(value = "select * from get_flat_with_max_coordinates_func()", nativeQuery = true)
    Optional<Flat> getFlatWithMaxCoordinates();

    @Query(value = "select * from get_flats_by_substr_of_name_func(:prefix)", nativeQuery = true)
    List<Flat> getFlatsBySubstringOfName(@Param("prefix") String prefix);

    @Query(value = "select * from get_flats_sorted_by_distance_from_subway(:metro_x, :metro_y)", nativeQuery = true)
    List<Flat> getFlatsSortedByDistanceFromSubway(@Param("metro_x") Long metroX, @Param("metro_y") Long metroY);

    @Query(value = "select * from choose_more_cheaper_flat_by_ids(:id1, :id2)", nativeQuery = true)
    Optional<Flat> chooseMoreCheaperFlatByIds(@Param("id1") Long id1, @Param("id2") Long id2);
}
