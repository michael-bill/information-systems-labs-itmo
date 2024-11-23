package com.michael.app.service;

import com.michael.app.dto.HouseDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import com.michael.app.entity.User;
import com.michael.app.exception.NoRulesException;
import com.michael.app.repository.HouseRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HouseService {

    private final HouseRepository houseRepository;
    private final NotificationService notificationService;

    public House create(HouseDto houseDto, User user) {
        House house = houseRepository.save(HouseDto.convertFromDto(houseDto, user));
        notificationService.notifyAboutCreate(house);
        return house;
    }

    public House updateById(Long id, HouseDto houseDto, User user) {
        House houseToUpdate = houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
        if (!hasRulesForUpdateHouse(houseToUpdate, user))
            throw new NoRulesException("У вас не прав на редактирование объекта House, " +
                    "так как вы не его владелец или пользователь запретил его редактировать");
        House updatedHouse = HouseDto.convertFromDto(houseDto);
        updatedHouse.setId(id);
        updatedHouse = houseRepository.save(updatedHouse);
        notificationService.notifyAboutChange(updatedHouse);
        return updatedHouse;
    }

    public void deleteById(Long id, User user) {
        House houseToDelete = houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
        if (!hasRulesForDeleteHouse(houseToDelete, user))
            throw new NoRulesException("У вас не прав на удаление объекта House, так как вы не его владелец, " +
                    "или вы не владелец всех Flats, что с ним связаны, или пользователь запретил его удалять");
        houseRepository.deleteById(id);
        notificationService.notifyAboutDeleteHouse(id);
    }

    public House getById(Long id) {
        return houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
    }

    public Page<House> getAll(Pageable pageable) {
        return houseRepository.findAll(pageable);
    }

    public Page<House> getByFilter(Map<String, Object> filterParams, Pageable pageable) {
        Specification<House> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            filterParams.forEach((key, value) -> {
                try {
                    String valueAsString = value.toString();
                    predicates.add(criteriaBuilder.like(
                            criteriaBuilder.lower(root.get(key).as(String.class)),
                            "%" + valueAsString.toLowerCase() + "%")
                    );
                } catch (Exception ignored) { }
            });
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        return houseRepository.findAll(specification, pageable);
    }

    public List<Flat> getAllFlatsByHouseId(Long id) {
        return houseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"))
                .getFlats();
    }

    private boolean hasRulesForUpdateHouse(House house, User user) {
        if (user.getRole() == User.Role.ROLE_ADMIN && house.getEditable()) return true;
        return house.getUser().getId().equals(user.getId());
    }

    private boolean hasRulesForDeleteHouse(House house, User user) {
        if (user.getRole() == User.Role.ROLE_ADMIN && house.getEditable()) return true;
        return
                house.getUser().getId().equals(user.getId()) &&
                house.getFlats().stream().allMatch(flat -> flat.getUser().getId().equals(user.getId()));
    }
}
