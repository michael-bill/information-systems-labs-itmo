package com.michael.app.service;

import com.michael.app.dto.HouseDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import com.michael.app.entity.User;
import com.michael.app.exception.NoRulesException;
import com.michael.app.repository.HouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HouseService {

    private final HouseRepository houseRepository;

    public House create(HouseDto house, User user) {
        return houseRepository.save(HouseDto.convertFromDto(house, user));
    }

    public House updateById(Long id, HouseDto house, User user) {
        House houseToUpdate = houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
        if (!hasRulesForUpdateHouse(houseToUpdate, user))
            throw new NoRulesException("У вас не прав на редактирование объекта House, так как вы не его владелец");
        House updatedHouse = HouseDto.convertFromDto(house);
        updatedHouse.setId(id);
        return houseRepository.save(updatedHouse);
    }

    public void deleteById(Long id, User user) {
        House houseToDelete = houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
        if (!hasRulesForDeleteHouse(houseToDelete, user))
            throw new NoRulesException("У вас не прав на удаление объекта House, так как вы не его владелец " +
                    "или вы не владелец всех Flats, что с ним связаны");
        houseRepository.deleteById(id);
    }

    public House getById(Long id) {
        return houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
    }

    public Page<House> getAll(Pageable pageable) {
        return houseRepository.findAll(pageable);
    }

    public List<Flat> getAllFlatsByHouseId(Long id) {
        return houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"))
                .getFlats();
    }

    private boolean hasRulesForUpdateHouse(House house, User user) {
        if (user.getRole() == User.Role.ROLE_ADMIN) return true;
        return house.getUser().getId().equals(user.getId());
    }

    private boolean hasRulesForDeleteHouse(House house, User user) {
        if (user.getRole() == User.Role.ROLE_ADMIN) return true;
        return
                house.getUser().getId().equals(user.getId()) &&
                house.getFlats().stream().allMatch(flat -> flat.getUser().getId().equals(user.getId()));
    }
}
