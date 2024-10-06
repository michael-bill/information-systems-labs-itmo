package com.michael.app.dto;

import com.michael.app.entity.House;
import com.michael.app.entity.User;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class HouseDto {
    private String name;
    private Long year;
    private Long numberOfFlatsOnFloor;

    public static House convertFromDto(HouseDto houseDto) {
        return House.builder()
                .name(houseDto.getName())
                .year(houseDto.getYear())
                .numberOfFlatsOnFloor(houseDto.getNumberOfFlatsOnFloor())
                .build();
    }

    public static House convertFromDto(HouseDto houseDto, User user) {
        House house = convertFromDto(houseDto);
        house.setUser(user);
        return house;
    }
}
