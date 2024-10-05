package com.michael.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.time.ZonedDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "flat")
public class Flat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    private Long id;

    @NotNull(message = "Поле name не может быть пустым")
    @NotNull(message = "Поле name не может быть пустым")
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull(message = "Поля x, y coordinates не могут быть пустыми")
    @Embedded
    private Coordinates coordinates;

    @NotNull(message = "Поле creationDate не может быть пустым")
    @Column(name = "creation_date", nullable = false)
    private ZonedDateTime creationDate;

    @PositiveOrZero(message = "Поле area должно быть положительным")
    @Column(name = "area", nullable = false)
    private Float area;

    @PositiveOrZero(message = "Поле price должно быть положительным")
    @Column(name = "price", nullable = false)
    private Float price;

    @Column(name = "balcony")
    private Boolean balcony;

    @PositiveOrZero(message = "Поле timeToMetroOnFoot должно быть положительным")
    @Column(name = "time_to_metro_on_foot")
    private Integer timeToMetroOnFoot;

    @PositiveOrZero(message = "Поле numberOfRooms должно быть положительным")
    @Max(value = 7, message = "Поле numberOfRooms не может быть больше 7")
    @Column(name = "number_of_rooms")
    private Integer numberOfRooms;

    @PositiveOrZero(message = "Поле numberOfBathrooms должно быть положительным")
    @Column(name = "number_of_bathrooms")
    private Integer numberOfBathrooms;

    @PositiveOrZero(message = "Поле timeToMetroByTransport должно быть положительным")
    @Column(name = "time_to_metro_by_transport")
    private Double timeToMetroByTransport;

    @NotNull(message = "Поле view не может быть пустым")
    @Enumerated(EnumType.STRING)
    @Column(name = "view", nullable = false)
    private View view;

    @NotNull(message = "Поле house не может быть пустым")
    @ManyToOne
    @JoinColumn(name = "house_id", nullable = false)
    private House house;

    @PrePersist
    protected void onCreate() {
        this.creationDate = ZonedDateTime.now();
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class Coordinates {
        private Long x;
        private Long y;
    }

    public enum View {
        STREET,
        BAD,
        NORMAL,
        TERRIBLE;
    }
}
