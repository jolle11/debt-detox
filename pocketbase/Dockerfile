FROM alpine:3.22

ARG PB_VERSION=0.39.1
ARG TARGETARCH

RUN apk add --no-cache ca-certificates unzip wget \
	&& case "${TARGETARCH:-amd64}" in \
		amd64) PB_ARCH="amd64" ;; \
		arm64) PB_ARCH="arm64" ;; \
		*) echo "Unsupported architecture: ${TARGETARCH}" >&2; exit 1 ;; \
	esac \
	&& wget -q -O /tmp/pocketbase.zip \
		"https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip" \
	&& unzip /tmp/pocketbase.zip -d /pb \
	&& rm /tmp/pocketbase.zip

WORKDIR /pb

COPY pb_migrations ./pb_migrations
COPY pb_hooks ./pb_hooks

EXPOSE 8080

CMD ["sh", "-c", "exec ./pocketbase serve \"--http=0.0.0.0:${PORT:-8080}\" \"--origins=${PB_ALLOWED_ORIGINS:-*}\""]
