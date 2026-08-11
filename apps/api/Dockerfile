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

# Tess4J 5.16.0 / Lept4J 1.21.1 requires
# a newer Leptonica API than Ubuntu 22.04 provides.
#
# Build Leptonica 1.85.0 from source.

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        git \
        pkg-config \
        autoconf \
        automake \
        libtool \
        libpng-dev \
        libjpeg-dev \
        libtiff-dev \
        libwebp-dev \
        libopenjp2-7-dev \
        zlib1g-dev \
    && git clone --depth 1 --branch 1.85.0 \
        https://github.com/DanBloomberg/leptonica.git \
        /tmp/leptonica \
    && cd /tmp/leptonica \
    && ./configure \
        --prefix=/usr/local \
        --disable-programs \
        --disable-doc \
    && make -j2 \
    && make install \
    && ldconfig \
    && rm -rf /tmp/leptonica \
    && apt-get remove -y \
        build-essential \
        git \
        pkg-config \
        autoconf \
        automake \
        libtool \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY --from=builder /build/target/*.jar /app/accordiq-api.jar

ENV JAVA_OPTS="-Xms128m -Xmx300m"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/accordiq-api.jar"]