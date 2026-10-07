# ==============================================================================
# STAGE 1: Build & Package Backend JAR with Maven
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Allocate sufficient memory for Maven build on Railway
ENV MAVEN_OPTS="-Xmx1536m -XX:+UseG1GC"

# 1. Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 2. Copy source code and build production executable jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# STAGE 2: Lightweight Production JRE Runtime (Ubuntu Jammy for native ONNX glibc support)
# ==============================================================================
FROM eclipse-temurin:17-jre-jammy AS runner

# Install curl for container health checks and tzdata for Philippine Standard Time
RUN apt-get update && apt-get install -y --no-install-recommends curl tzdata \
    && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Manila

WORKDIR /app

# Create unprivileged system user and group for security
RUN groupadd -r spring && useradd -r -g spring spring

# Create uploads directory for resident document submissions
RUN mkdir -p /app/uploads/barangay_requests \
    && chown -R spring:spring /app

# Copy the built jar from builder stage
COPY --from=builder --chown=spring:spring /build/target/*.jar /app/app.jar

USER spring:spring

EXPOSE 8080

# Tuned specifically for Railway:
# - MaxRAMPercentage=65.0 reserves 35% headroom for ONNX native C++ off-heap memory and JVM metaspace
# - Prevents container Exit Code 137 (OOMKilled) under concurrent AI inference loads
ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=65.0 -XX:InitialRAMPercentage=40.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

# Healthcheck with generous 60s start period to allow Spring Boot & ONNX models to load completely
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/swagger-ui.html || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/app.jar"]