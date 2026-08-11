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

# ==========================================================
# Native OCR dependencies
#
# Tess4J 5.16.0 -> Lept4J 1.21.1
# Lept4J 1.21.1 uses Leptonica 1.85.0.
#
# Ubuntu 22.04 ships an older Leptonica, so we build
# Leptonica 1.85.0 from its official release archive.
# ==========================================================

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        curl \
        pkg-config \
        libpng-dev \
        libjpeg-dev \
        libtiff-dev \
        libwebp-dev \
        libopenjp2-7-dev \
        zlib1g-dev \
    \
    && mkdir -p /tmp/leptonica \
    \
    && curl -fsSL \
        https://github.com/DanBloomberg/leptonica/archive/refs/tags/1.85.0.tar.gz \
        -o /tmp/leptonica.tar.gz \
    \
    && tar -xzf /tmp/leptonica.tar.gz \
        --strip-components=1 \
        -C /tmp/leptonica \
    \
    && cd /tmp/leptonica \
    \
    && ./configure \
        --prefix=/usr/local \
        --disable-programs \
        --disable-doc \
    \
    && make -j2 \
    && make install \
    && ldconfig \
    \
    && mkdir -p /opt/tesseract/tessdata \
    \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr-eng \
    \
    && cp \
        /usr/share/tesseract-ocr/4.00/tessdata/eng.traineddata \
        /opt/tesseract/tessdata/eng.traineddata \
    \
    && rm -rf /tmp/leptonica /tmp/leptonica.tar.gz \
    \
    && apt-get remove -y \
        build-essential \
        curl \
        pkg-config \
    \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*


# ==========================================================
# Application
# ==========================================================

WORKDIR /app

COPY --from=builder /build/target/*.jar /app/accordiq-api.jar


# Keep the JVM within Render's free-instance memory budget.
ENV JAVA_OPTS="-Xms128m -Xmx300m"


# Render supplies the PORT environment variable.
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/accordiq-api.jar"]