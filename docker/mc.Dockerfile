FROM --platform=$BUILDPLATFORM golang:1.25-bookworm AS build
ARG TARGETOS
ARG TARGETARCH
ARG MC_VERSION=RELEASE.2025-08-13T08-35-41Z
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 go install github.com/minio/mc@${MC_VERSION} \
    && mkdir /out \
    && if [ -f /go/bin/mc ]; then \
        cp /go/bin/mc /out/mc; \
    else \
        cp /go/bin/${TARGETOS}_${TARGETARCH}/mc /out/mc; \
    fi
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /out/mc /usr/local/bin/mc
ENTRYPOINT ["mc"]
