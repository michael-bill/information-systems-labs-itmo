package com.michael.app.service;

import com.michael.app.dto.FlatDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import com.michael.app.repository.FlatRepository;
import com.michael.app.repository.HouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FlatService {

    private final FlatRepository flatRepository;
    private final HouseRepository houseRepository;

    public Flat createFlat(FlatDto flat) {
        House house = houseRepository.findById(flat.getHouseId())
                .orElseThrow(() -> new IllegalArgumentException("House с таким ID не существует"));
        return flatRepository.save(FlatDto.convertFromDto(flat, house));
    }
}
