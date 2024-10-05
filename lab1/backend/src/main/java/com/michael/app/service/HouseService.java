package com.michael.app.service;

import com.michael.app.dto.HouseDto;
import com.michael.app.entity.House;
import com.michael.app.repository.HouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HouseService {
    private final HouseRepository houseRepository;

    public House createHouse(HouseDto house) {
        return houseRepository.save(HouseDto.convertFromDto(house));
    }
}
