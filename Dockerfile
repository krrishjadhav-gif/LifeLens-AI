# Stage 1: Build the Spring Boot application using Maven and Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source files
COPY pom.xml .
COPY src ./src

# Package application jar (skipping tests during Docker image build)
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 17 Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy compiled jar from build stage
COPY --from=build /app/target/lifelens-ai-0.0.1-SNAPSHOT.jar app.jar

# Expose Spring Boot web port
EXPOSE 8080

# Run Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
