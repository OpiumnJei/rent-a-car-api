package com.project.rent_a_car_api.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/**
 * Blindaje de Arquitectura Hexagonal (RNF-01):
 * el modulo {@code domain} no debe poseer dependencias de frameworks
 * externos (Spring, JPA/Hibernate, Lombok, MapStruct) y las dependencias
 * entre capas solo fluyen hacia el dominio.
 */
class HexagonalArchitectureTest {

    private static final String BASE = "com.project.rent_a_car_api";

    private final JavaClasses classes = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages(BASE);

    @Test
    void domainNoDependeDeFrameworks() {
        ArchRule rule = noClasses()
                .that().resideInAPackage(BASE + ".domain..")
                .should().dependOnClassesThat().resideInAnyPackage(
                        "org.springframework..",
                        "jakarta.persistence..",
                        "jakarta.transaction..",
                        "org.hibernate..",
                        "lombok..",
                        "org.mapstruct..",
                        "io.swagger..",
                        "org.springdoc.."
                )
                .allowEmptyShould(true);
        rule.check(classes);
    }

    @Test
    void domainNoDependeDeOtrasCapas() {
        ArchRule rule = noClasses()
                .that().resideInAPackage(BASE + ".domain..")
                .should().dependOnClassesThat().resideInAnyPackage(
                        BASE + ".application..",
                        BASE + ".infrastructure.."
                )
                .allowEmptyShould(true);
        rule.check(classes);
    }

    @Test
    void applicationNoDependeDeInfrastructure() {
        ArchRule rule = noClasses()
                .that().resideInAPackage(BASE + ".application..")
                .should().dependOnClassesThat().resideInAPackage(BASE + ".infrastructure..")
                .allowEmptyShould(true);
        rule.check(classes);
    }
}
