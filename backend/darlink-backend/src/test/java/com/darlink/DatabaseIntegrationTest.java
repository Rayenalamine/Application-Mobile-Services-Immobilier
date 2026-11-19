package com.darlink;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
public class DatabaseIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Test
    @DisplayName("Vérifie que la source de données JDBC s'injecte et répond correctement")
    void testDataSourceConnection() throws Exception {
        assertNotNull(dataSource, "Le DataSource ne doit pas être nul");
        try (Connection connection = dataSource.getConnection()) {
            assertNotNull(connection, "La connexion JDBC doit être établie");
            assertTrue(connection.isValid(2), "La connexion JDBC doit être valide");
        }
    }
}

