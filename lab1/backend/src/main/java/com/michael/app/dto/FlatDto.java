package com.michael.app.dto;

import com.michael.app.entity.Flat;
import com.michael.app.entity.Flat.*;
import com.michael.app.entity.House;
import com.michael.app.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
@Builder
public class FlatDto {
    private String name;
    private Coordinates coordinates;
    private ZonedDateTime creationDate;
    private Float area;
    private Float price;
    private Boolean balcony;
    private Integer timeToMetroOnFoot;
    private Integer numberOfRooms;
    private Integer numberOfBathrooms;
    private Double timeToMetroByTransport;
    private View view;
    private Long houseId;

    public static Flat convertFromDto(FlatDto flatDto, House house) {
        return Flat.builder()
                .name(flatDto.getName())
                .coordinates(flatDto.getCoordinates())
                .creationDate(flatDto.getCreationDate())
                .area(flatDto.getArea())
                .price(flatDto.getPrice())
                .balcony(flatDto.getBalcony())
                .timeToMetroOnFoot(flatDto.getTimeToMetroOnFoot())
                .numberOfRooms(flatDto.getNumberOfRooms())
                .numberOfBathrooms(flatDto.getNumberOfBathrooms())
                .timeToMetroByTransport(flatDto.getTimeToMetroByTransport())
                .view(flatDto.getView())
                .house(house)
                .build();
    }

    public static Flat convertFromDto(FlatDto flatDto, House house, User user) {
        Flat flat = convertFromDto(flatDto, house);
        flat.setUser(user);
        return flat;
    }
}