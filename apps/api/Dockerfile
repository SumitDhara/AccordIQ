# ============================================================
# Stage 1 — Build Spring Boot application
# ============================================================
FROM maven:3.9.9-eclipse-temurin-21 AS app-builder

WORKDIR /workspace

COPY pom.xml .
COPY mvnw .
COPY .mvn ./.mvn

RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline -B

COPY src ./src

RUN ./mvnw clean package -DskipTests -B \
    && ls -lah target


# ============================================================
# Stage 2 — Build Leptonica 1.85.0
# ============================================================
FROM ubuntu:22.04 AS leptonica-builder

ARG LEPTONICA_VERSION=1.85.0
ARG LEPTONICA_SHA256=3745ae3bf271a6801a2292eead83ac926e3a9bc1bf622e9cd4dd0f3786e17205

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        build-essential \
        autoconf \
        automake \
        libtool \
        pkg-config \
        libjpeg-dev \
        libpng-dev \
        libtiff-dev \
        libwebp-dev \
        libopenjp2-7-dev \
        libgif-dev \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp

RUN curl -fsSL \
        "https://github.com/DanBloomberg/leptonica/releases/download/${LEPTONICA_VERSION}/leptonica-${LEPTONICA_VERSION}.tar.gz" \
        -o "leptonica-${LEPTONICA_VERSION}.tar.gz" \
    && echo "${LEPTONICA_SHA256}  leptonica-${LEPTONICA_VERSION}.tar.gz" \
        | sha256sum -c - \
    && tar -xzf "leptonica-${LEPTONICA_VERSION}.tar.gz" \
    && cd "leptonica-${LEPTONICA_VERSION}" \
    && ./configure \
        --prefix=/usr/local \
        --enable-shared \
        --disable-static \
        --disable-programs \
    && make -j"$(nproc)" \
    && make install-strip \
    && ldconfig \
    && ldconfig -p | grep -i leptonica


# ============================================================
# Stage 3 — Runtime
# ============================================================
FROM eclipse-temurin:21-jre-jammy

ENV DEBIAN_FRONTEND=noninteractive
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

COPY --from=leptonica-builder \
    /usr/local/lib/libleptonica.so* \
    /usr/local/lib/

RUN printf '%s\n' '/usr/local/lib' \
        > /etc/ld.so.conf.d/accordiq-leptonica.conf \
    && ldconfig \
    && ldconfig -p | grep -i leptonica

WORKDIR /app

COPY --from=app-builder \
    /workspace/target/*.jar \
    /app/accordiq-api.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "/app/accordiq-api.jar"]