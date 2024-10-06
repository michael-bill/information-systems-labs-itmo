package com.michael.app.service;

import com.michael.app.dto.HouseDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import com.michael.app.repository.HouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HouseService {

    private final HouseRepository houseRepository;

    public House create(HouseDto house) {
        return houseRepository.save(HouseDto.convertFromDto(house));
    }

    public House updateById(Long id, HouseDto house) {
        if (!houseRepository.existsById(id)) throw new IllegalArgumentException("House с таким ID не существует");
        House updatedHouse = HouseDto.convertFromDto(house);
        updatedHouse.setId(id);
        return houseRepository.save(updatedHouse);
    }

    public void deleteById(Long id) {
        if (!houseRepository.existsById(id)) throw new IllegalArgumentException("House с таким ID не существует");
        houseRepository.deleteById(id);
    }

    public House getById(Long id) {
        return houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким ID не существует"));
    }

    public List<House> getAll() {
        return houseRepository.findAll();
    }

    public List<Flat> getAllFlatsByHouseId(Long id) {
        return houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким ID не существует"))
                .getFlats();
    }
}
