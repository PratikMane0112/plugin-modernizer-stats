#!/bin/bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
ZIP_URL="https://github.com/jenkins-infra/metadata-plugin-modernizer/archive/refs/heads/main.zip"
TMP_DIR=".tmp"
ZIP_FILE="${TMP_DIR}/metadata-plugin-modernizer-main.zip"
ETAG_FILE="${TMP_DIR}/.etag"
EXTRACTED_DIR="${TMP_DIR}/metadata-plugin-modernizer-main"

# ── Dependency check ────────────────────────────────────────────────────────
command -v curl >/dev/null 2>&1 || { echo "[ERROR] 'curl' is required but not installed."; exit 1; }
command -v unzip >/dev/null 2>&1 || { echo "[ERROR] 'unzip' is required but not installed."; exit 1; }

# ── Cleanup trap: always remove ZIP on exit ─────────────────────────────────
cleanup() {
    if [ -f "${ZIP_FILE}" ]; then
        rm -f "${ZIP_FILE}"
        echo "[INFO] Cleaned up ZIP file."
    fi
}
trap cleanup EXIT

# ── Prepare temp directory ──────────────────────────────────────────────────
mkdir -p "${TMP_DIR}"

# ── ETag-based incremental download ────────────────────────────────────────
CURL_ARGS=(--silent --location --fail --output "${ZIP_FILE}")

if [ -f "${ETAG_FILE}" ] && [ -d "${EXTRACTED_DIR}" ]; then
    STORED_ETAG=$(cat "${ETAG_FILE}")
    echo "[INFO] Found cached ETag: ${STORED_ETAG}"
    CURL_ARGS+=(--header "If-None-Match: ${STORED_ETAG}")
fi

HTTP_CODE=$(curl --write-out "%{http_code}" "${CURL_ARGS[@]}" "${ZIP_URL}" 2>/dev/null || true)

if [ "${HTTP_CODE}" = "304" ]; then
    echo "[INFO] Data unchanged (HTTP 304), skipping download."
    # Validate the existing extracted data is still good
elif [ "${HTTP_CODE}" = "200" ]; then
    echo "[INFO] Downloaded fresh data (HTTP 200)."

    # Save ETag from a HEAD request for next time
    NEW_ETAG=$(curl --silent --head --location "${ZIP_URL}" 2>/dev/null | grep -i '^etag:' | sed 's/^[eE][tT][aA][gG]: *//;s/\r$//' | head -1)
    if [ -n "${NEW_ETAG}" ]; then
        echo "${NEW_ETAG}" > "${ETAG_FILE}"
        echo "[INFO] Saved ETag: ${NEW_ETAG}"
    fi

    # Remove old extracted data
    rm -rf "${EXTRACTED_DIR}"

    # Unzip
    unzip -q -o "${ZIP_FILE}" -d "${TMP_DIR}"
    echo "[INFO] Unzipped to ${EXTRACTED_DIR}"

    # Delete unnecessary files from the extracted content
    rm -rf "${EXTRACTED_DIR}/.github"
    rm -f "${EXTRACTED_DIR}/.gitignore"
    rm -f "${EXTRACTED_DIR}/README.md"
    rm -f "${EXTRACTED_DIR}/requirements.txt"
    rm -f "${EXTRACTED_DIR}/CONTRIBUTING.md"
    rm -f "${EXTRACTED_DIR}/CODE_OF_CONDUCT.md"
    rm -f "${EXTRACTED_DIR}/SECURITY.md"
    echo "[INFO] Cleaned up unnecessary files."
else
    echo "[ERROR] Failed to download data. HTTP code: ${HTTP_CODE}"
    # If we have an existing extraction, we can still continue
    if [ -d "${EXTRACTED_DIR}" ]; then
        echo "[WARN] Using previously cached data."
    else
        exit 1
    fi
fi

# ── Validate extracted content ──────────────────────────────────────────────
echo "[INFO] Validating extracted data..."

if [ ! -f "${EXTRACTED_DIR}/reports/summary.md" ]; then
    echo "[ERROR] Validation failed: reports/summary.md not found."
    exit 1
fi

if [ ! -d "${EXTRACTED_DIR}/reports/recipes" ] || [ -z "$(ls -A "${EXTRACTED_DIR}/reports/recipes" 2>/dev/null)" ]; then
    echo "[ERROR] Validation failed: reports/recipes/ is missing or empty."
    exit 1
fi

# Check that at least one plugin directory with reports/ exists
PLUGIN_WITH_REPORTS=0
for dir in "${EXTRACTED_DIR}"/*/; do
    dirname=$(basename "${dir}")
    if [ "${dirname}" = "reports" ] || [ "${dirname}" = ".github" ] || [ "${dirname}" = ".git" ]; then
        continue
    fi
    if [ -d "${dir}reports" ]; then
        PLUGIN_WITH_REPORTS=$((PLUGIN_WITH_REPORTS + 1))
    fi
done

if [ "${PLUGIN_WITH_REPORTS}" -lt 1 ]; then
    echo "[ERROR] Validation failed: No plugin directories with reports/ subdirectory found."
    exit 1
fi

echo "[INFO] Validation passed. Found ${PLUGIN_WITH_REPORTS} plugin(s) with reports."
echo "[INFO] Data ready in ${EXTRACTED_DIR}"
