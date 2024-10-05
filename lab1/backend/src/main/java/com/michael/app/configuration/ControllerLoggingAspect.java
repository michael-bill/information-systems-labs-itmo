package com.michael.app.configuration;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ControllerLoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(ControllerLoggingAspect.class);

    @Before("execution(* com.michael.app.contoller..*(..))")
    public void logBefore(JoinPoint joinPoint) {
        logger.info("Executing method: {} with arguments: {}", joinPoint.getSignature().getName(), joinPoint.getArgs());
    }
}
