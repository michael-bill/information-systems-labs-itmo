package com.michael.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "house")
public class House {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    private Long id;

    @Column(name = "name", nullable = false)
    @NotNull(message = "Поле name не может быть пустым")
    private String name;

    @Column(name = "year", nullable = false)
    @NotNull(message = "Поле year не может быть пустым")
    @Positive(message = "Поле year должно быть больше 0")
    @Max(value = 552, message = "Поле year не может быть больше 552")
    private Long year;

    @Column(name = "number_of_flats_on_floor", nullable = false)
    @NotNull(message = "Поле numberOfFlatsOnFloor не может быть пустым")
    @Positive(message = "Поле numberOfFlatsOnFloor должно быть больше 0")
    private Long numberOfFlatsOnFloor;

    @JsonIgnore
    @OneToMany(mappedBy = "house", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Flat> flats;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "is_editable", nullable = false, columnDefinition = "boolean default true")
    private Boolean editable;
}
