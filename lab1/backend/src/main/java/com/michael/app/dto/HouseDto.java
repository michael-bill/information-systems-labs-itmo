package com.michael.app.dto;

import com.michael.app.entity.House;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class HouseDto {
    private String name;
    private Long year;
    private Long numberOfFlatsOnFloor;

    public static House convertFromDto(HouseDto house) {
        return House.builder()
                .name(house.getName())
                .year(house.getYear())
                .numberOfFlatsOnFloor(house.getNumberOfFlatsOnFloor())
                .build();
    }
}
