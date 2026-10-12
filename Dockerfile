# --- Etapa 1: compilacion ---
# Por que multi-stage: la imagen final solo lleva JRE + jar (sin JDK, Maven ni fuentes).
# Por que mvn de la imagen y no ./mvnw: evita fallos por CRLF del wrapper al compilar en Windows.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -q -DskipTests package

# --- Etapa 2: ejecucion ---
FROM eclipse-temurin:17-jre
# Por que usuario no-root: buena practica de seguridad en contenedores.
RUN useradd --system --create-home appuser
USER appuser
WORKDIR /app
# Por que nombre explicito: el repackage deja tambien el .original y el wildcard copiaria dos jars.
COPY --from=build /app/target/rent-a-car-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
