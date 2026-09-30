FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

COPY pom.xml .

RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

#  Lightweight Production JRE Runtime
FROM eclipse-temurin:17-jre-alpine AS runner

RUN apk add --no-cache curl tzdata

ENV TZ=Asia/Manila

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

RUN mkdir -p /app/uploads/barangay_requests \
    && chown -R spring:spring /app

COPY --from=builder --chown=spring:spring /build/target/*.jar /app/app.jar

USER spring:spring

EXPOSE 8080

ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/swagger-ui.html || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/app.jar"]