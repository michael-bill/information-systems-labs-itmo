package com.michael.app.entity.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MinimalPriceValidator.class)
@Documented
public @interface ValidMinimalPrice {
    String message() default "Цена должна быть не меньше минимальной расчетной цены: формула price >= sqrt(area) * 10";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
