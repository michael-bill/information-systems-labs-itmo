package com.michael.app.entity.validation;

import com.michael.app.entity.Flat;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import static java.lang.Math.sqrt;

public class MinimalPriceValidator implements ConstraintValidator<ValidMinimalPrice, Flat> {
    @Override
    public boolean isValid(Flat flat, ConstraintValidatorContext context) {
        if (flat.getArea() == null || flat.getPrice() == null) {
            return true;
        }

        float minimalPrice = calculateMinimalPrice(flat.getArea());
        return flat.getPrice() >= minimalPrice;
    }

    private float calculateMinimalPrice(float area) {
        return (float) sqrt(area) * 10.f;
    }
}
