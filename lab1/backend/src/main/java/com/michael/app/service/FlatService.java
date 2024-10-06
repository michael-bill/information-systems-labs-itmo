package com.michael.app.service;

import com.michael.app.dto.FlatDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import com.michael.app.entity.User;
import com.michael.app.exception.NoRulesException;
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

    public Flat create(FlatDto flat, User user) {
        House house = houseRepository.findById(flat.getHouseId())
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
        return flatRepository.save(FlatDto.convertFromDto(flat, house, user));
    }

    public Flat updateById(Long id, FlatDto flat, User user) throws IllegalArgumentException {
        Flat flatToUpdate = flatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flat с таким id не существует"));
        if (!hasRulesForFlat(flatToUpdate, user))
            throw new NoRulesException("У вас не прав на редактирование объекта Flat, так как вы не его владелец");
        House houseToUpdate = houseRepository.findById(flat.getHouseId())
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
        Flat updatedFlat = FlatDto.convertFromDto(flat, houseToUpdate, user);
        updatedFlat.setId(id);
        return flatRepository.save(updatedFlat);
    }

    public void deleteById(Long id, User user) {
        Flat flatToDelete = flatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flat с таким id не существует"));
        if (!hasRulesForFlat(flatToDelete, user))
            throw new NoRulesException("У вас не прав на удаление объекта Flat, так как вы не его владелец");
        flatRepository.deleteById(id);
    }

    public Flat getById(Long id) {
        return flatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flat с таким id не существует"));
    }

    public List<Flat> getAll() {
        return flatRepository.findAll();
    }

    private boolean hasRulesForFlat(Flat flat, User user) {
        if (user.getRole() == User.Role.ROLE_ADMIN) return true;
        return flat.getUser().getId().equals(user.getId());
    }
}
