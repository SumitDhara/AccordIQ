# ==========================================================
# Build stage
# ==========================================================

FROM maven:3.9.11-eclipse-temurin-21 AS builder

WORKDIR /build

COPY pom.xml ./

RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests -B

# ==========================================================
# Runtime stage
# ==========================================================

FROM eclipse-temurin:21-jre-jammy

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-eng \
    && mkdir -p /opt/tesseract/tessdata \
    && cp /usr/share/tesseract-ocr/4.00/tessdata/eng.traineddata /opt/tesseract/tessdata/ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /build/target/*.jar /app/accordiq-api.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/accordiq-api.jar"]