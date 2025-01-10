package com.michael.app.service.core;

import com.michael.app.dto.FlatDto;
import com.michael.app.entity.Flat;
import com.michael.app.entity.House;
import com.michael.app.entity.User;
import com.michael.app.exception.NoRulesException;
import com.michael.app.repository.FlatRepository;
import com.michael.app.repository.HouseRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FlatService {

    private final FlatRepository flatRepository;
    private final HouseRepository houseRepository;
    private final NotificationService notificationService;

    public Flat create(FlatDto flatDto, User user) {
        House house = houseRepository.findById(flatDto.getHouseId())
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
        Flat flat = flatRepository.save(FlatDto.convertFromDto(flatDto, house, user));
        notificationService.notifyAboutCreate(flat);
        return flat;
    }

    public Flat updateById(Long id, FlatDto flatDto, User user) throws IllegalArgumentException {
        Flat flatToUpdate = flatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flat с таким id не существует"));
        if (!hasRulesForFlat(flatToUpdate, user))
            throw new NoRulesException("У вас не прав на редактирование объекта Flat, " +
                    "так как вы не его владелец или пользователь запретил его редактировать");
        House houseToUpdate = houseRepository.findById(flatDto.getHouseId())
                .orElseThrow(() -> new IllegalArgumentException("House с таким id не существует"));
        User originalUser = flatToUpdate.getUser();
        Flat updatedFlat = FlatDto.convertFromDto(flatDto, houseToUpdate, originalUser);
        updatedFlat.setId(id);
        updatedFlat = flatRepository.save(updatedFlat);
        notificationService.notifyAboutChange(updatedFlat);
        return updatedFlat;
    }

    public void deleteById(Long id, User user) {
        Flat flatToDelete = flatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flat с таким id не существует"));
        if (!hasRulesForFlat(flatToDelete, user))
            throw new NoRulesException("У вас не прав на удаление объекта Flat, " +
                    "так как вы не его владелец или пользователь запретил его удалять");
        flatRepository.deleteById(id);
        notificationService.notifyAboutDeleteFlat(id);
    }

    public Flat getById(Long id) {
        return flatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flat с таким id не существует"));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Page<Flat> getAll(Pageable pageable) {
        return flatRepository.findAll(pageable);
    }

    public Page<Flat> getByFilter(Map<String, Object> filterParams, Pageable pageable) {
        Specification<Flat> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            filterParams.forEach((key, value) -> {
                try {
                    String valueAsString = value.toString();
                    predicates.add(criteriaBuilder.like(
                            criteriaBuilder.lower(root.get(key).as(String.class)),
                            "%" + valueAsString.toLowerCase() + "%"));
                } catch (Exception ignored) { }
            });
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        return flatRepository.findAll(specification, pageable);
    }

    public Flat getFlatWithMinNumberOfBathrooms() {
        return flatRepository.getFlatWithMinNumberOfBathrooms()
                .orElseThrow(() -> new IllegalArgumentException("Ни одного Flat ещё не существует"));
    }

    public Flat getFlatWithMaxCoordinates() {
        return flatRepository.getFlatWithMaxCoordinates()
                .orElseThrow(() -> new IllegalArgumentException("Ни одного Flat ещё не существует"));
    }

    public List<Flat> getFlatsBySubstringOfName(String prefix) {
        return flatRepository.getFlatsBySubstringOfName(prefix);
    }

    public List<Flat> getFlatsOrderedByTimeToMetroOnFoot() {
        return flatRepository.getFlatsOrderedByTimeToMetroOnFoot();
    }

    public Flat chooseMoreCheaperFlatByIds(Long id1, Long id2) {
        if (!flatRepository.existsById(id1)) {
            throw new IllegalArgumentException("Квартира с id=" + id1 + " не существует");
        }
        if (!flatRepository.existsById(id2)) {
            throw new IllegalArgumentException("Квартира с id=" + id2 + " не существует"); 
        }
        return flatRepository.chooseMoreCheaperFlatByIds(id1, id2)
                .orElseThrow(() -> new IllegalArgumentException("Произошла непредвиденная ошибка при выполнении запроса."));
    }

    private boolean hasRulesForFlat(Flat flat, User user) {
        if (user.getRole() == User.Role.ROLE_ADMIN)
            return true;
        return flat.getUser().getId().equals(user.getId());
    }

    public void deleteByHouseId(Long houseId) {
        if (!houseRepository.existsById(houseId)) {
            throw new IllegalArgumentException("House с таким id не существует");
        }
        List<Flat> flats = flatRepository.findByHouseId(houseId);
        boolean isDeleted = false;
        for (Flat flat : flats) {
            flatRepository.delete(flat);
            isDeleted = true;
        }
        if (isDeleted) {
            notificationService.notifyAboutDeleteFlat(flats.get(0).getId());
        }
    }
}
