package com.michael.app.configuration;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Configuration
public class SqlFunctionLoader {

    private final JdbcTemplate jdbcTemplate;

    private final ResourceLoader resourceLoader;

    @PostConstruct
    public void loadSqlFunctions() {
        String[] sqlFiles = new String[]{
                "classpath:psql/functions/choose_more_cheaper_flat_by_ids.sql",
                "classpath:psql/functions/get_flat_with_min_number_of_bathrooms_func.sql",
                "classpath:psql/functions/get_flat_with_max_coordinates_func.sql",
                "classpath:psql/functions/get_flats_by_substr_of_name_func.sql",
                "classpath:psql/functions/get_flats_sorted_by_distance_from_subway.sql"
        };

        for (String sqlFile : sqlFiles) {
            try {
                String sql = new BufferedReader(
                        new InputStreamReader(
                                resourceLoader.getResource(sqlFile).getInputStream(),
                                StandardCharsets.UTF_8))
                        .lines()
                        .collect(Collectors.joining("\n"));
                jdbcTemplate.execute(sql);
            } catch (Exception e) {
                log.error("Error loading SQL function: {}", sqlFile, e);
            }
        }
    }
}
