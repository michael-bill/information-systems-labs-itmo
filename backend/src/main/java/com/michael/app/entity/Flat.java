package com.michael.app.entity;

import com.michael.app.entity.validation.ValidMinimalPrice;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;

import static java.lang.Math.sqrt;

@ValidMinimalPrice
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
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull(message = "Поля x, y coordinates не могут быть пустыми")
    @Embedded
    private Coordinates coordinates;

    @NotNull(message = "Поле creationDate не может быть пустым")
    @Column(name = "creation_date", nullable = false)
    private ZonedDateTime creationDate;

    @Positive(message = "Поле area должно быть больше 0")
    @Column(name = "area", nullable = false)
    private Float area;

    @Positive(message = "Поле price должно быть больше 0")
    @Column(name = "price", nullable = false)
    private Float price;

    @Column(name = "balcony")
    private Boolean balcony;

    @Positive(message = "Поле timeToMetroOnFoot должно быть больше 0")
    @Column(name = "time_to_metro_on_foot")
    private Integer timeToMetroOnFoot;

    @Positive(message = "Поле numberOfRooms должно быть больше 0")
    @Max(value = 7, message = "Поле numberOfRooms не может быть больше 7")
    @Column(name = "number_of_rooms")
    private Integer numberOfRooms;

    @Positive(message = "Поле numberOfBathrooms должно быть больше 0")
    @Column(name = "number_of_bathrooms")
    private Integer numberOfBathrooms;

    @Positive(message = "Поле timeToMetroByTransport должно быть больше 0")
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

    @NotNull
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        this.creationDate = ZonedDateTime.now();
    }

    private static float calculateMinimalPrice(float area) {
        return (float) sqrt(area) * 10.f;
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    @Embeddable
    public static class Coordinates {
        @NotNull(message = "Координата X не может быть пустой")
        private Long x;
        @NotNull(message = "Координата Y не может быть пустой")
        private Long y;
    }

    public enum View {
        STREET,
        BAD,
        NORMAL,
        TERRIBLE;
    }
}
