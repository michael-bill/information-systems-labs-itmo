package com.michael.app.service;

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
        Flat updatedFlat = FlatDto.convertFromDto(flatDto, houseToUpdate, user);
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
                            "%" + valueAsString.toLowerCase() + "%")
                    );
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

    public List<Flat> getFlatsSortedByDistanceFromSubway(Long metroX, Long metroY) {
        return flatRepository.getFlatsSortedByDistanceFromSubway(metroX, metroY);
    }

    public Flat chooseMoreCheaperFlatByIds(Long id1, Long id2) {
        return flatRepository.chooseMoreCheaperFlatByIds(id1, id2)
                .orElseThrow(() -> new IllegalArgumentException("Произошла ошибка при выполнении запроса, " +
                        "вероятно id были указаны неверно."));
    }

    private boolean hasRulesForFlat(Flat flat, User user) {
        if (user.getRole() == User.Role.ROLE_ADMIN && flat.getEditable()) return true;
        return flat.getUser().getId().equals(user.getId());
    }
}
