FROM --platform=$BUILDPLATFORM golang:1.25-bookworm AS build
ARG TARGETOS
ARG TARGETARCH
ARG MINIO_VERSION=RELEASE.2025-10-15T17-29-55Z
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 go install github.com/minio/minio@${MINIO_VERSION} \
    && mkdir /out \
    && if [ -f /go/bin/minio ]; then \
        cp /go/bin/minio /out/minio; \
    else \
        cp /go/bin/${TARGETOS}_${TARGETARCH}/minio /out/minio; \
    fi
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/* && mkdir /data && chown 1000:1000 /data
COPY --from=build /out/minio /usr/local/bin/minio
USER 1000:1000
EXPOSE 9000 9001
ENTRYPOINT ["minio"]
