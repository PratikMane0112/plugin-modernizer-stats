#!/bin/bash

set -o nounset
set -o errexit
set -x

command -v "curl" >/dev/null || { echo "[ERROR] no 'curl' command found."; exit 1; }
command -v "unzip" >/dev/null || { echo "[ERROR] no 'unzip' command found."; exit 1; }

# Fetch metadata-plugin-modernizer repository zip, extract it and move it to public/ dir.

METADATA_LOCATION="${METADATA_LOCATION:-public/metadata}"

curl --silent --fail --output metadata-plugin-modernizer-main.zip --location "https://github.com/jenkins-infra/metadata-plugin-modernizer/archive/refs/heads/main.zip"
unzip -q -o metadata-plugin-modernizer-main.zip
mv metadata-plugin-modernizer-main "${METADATA_LOCATION}"
rm metadata-plugin-modernizer-main.zip

# Generate plugins index for the UI (only include directories with valid plugin data)
cd "${METADATA_LOCATION}" && find . -maxdepth 3 -path "*/reports/aggregated_migrations.json" -type f | sed 's|./||; s|/reports/aggregated_migrations.json||' | sort | jq -R . | jq -s . > plugins-index.json && cd -

echo "Data fetched successfully to ${METADATA_LOCATION}"
