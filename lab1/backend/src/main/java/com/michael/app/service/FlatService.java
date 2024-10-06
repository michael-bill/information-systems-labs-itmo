package com.michael.app.service;

import com.michael.app.dto.FlatDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import com.michael.app.repository.FlatRepository;
import com.michael.app.repository.HouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FlatService {

    private final FlatRepository flatRepository;
    private final HouseRepository houseRepository;

    public Flat create(FlatDto flat) {
        House house = houseRepository.findById(flat.getHouseId())
                .orElseThrow(() -> new IllegalArgumentException("House с таким ID не существует"));
        return flatRepository.save(FlatDto.convertFromDto(flat, house));
    }

    public Flat updateById(Long id, FlatDto flat) throws IllegalArgumentException {
        if (!flatRepository.existsById(id)) throw new IllegalArgumentException("Flat с таким ID не существует");
        House houseToUpdate = houseRepository.findById(flat.getHouseId())
                .orElseThrow(() -> new IllegalArgumentException("House с таким ID не существует"));
        Flat updatedFlat = FlatDto.convertFromDto(flat, houseToUpdate);
        updatedFlat.setId(id);
        return flatRepository.save(updatedFlat);
    }

    public void deleteById(Long id) {
        if (!flatRepository.existsById(id)) throw new IllegalArgumentException("Flat с таким ID не существует");
        flatRepository.deleteById(id);
    }

    public Flat getById(Long id) {
        return flatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flat с таким ID не существует"));
    }

    public List<Flat> getAll() {
        return flatRepository.findAll();
    }
}
