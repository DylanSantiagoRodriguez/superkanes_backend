#!/bin/sh
set -eu
mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null
mc mb --ignore-existing "local/$S3_BUCKET"
mc anonymous set none "local/$S3_BUCKET"
mc version enable "local/$S3_BUCKET"
mc admin user add local "$S3_ACCESS_KEY" "$S3_SECRET_KEY" >/dev/null
cat > /tmp/policy.json <<JSON
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:GetObject","s3:GetObjectVersion","s3:PutObject"],"Resource":["arn:aws:s3:::$S3_BUCKET/*"]}]}
JSON
mc admin policy create local superkanes-files /tmp/policy.json
mc admin policy attach local superkanes-files --user "$S3_ACCESS_KEY"
