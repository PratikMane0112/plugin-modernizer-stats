#!/bin/bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
ZIP_URL="https://github.com/jenkins-infra/metadata-plugin-modernizer/archive/refs/heads/main.zip"
TMP_DIR=".tmp"
ZIP_FILE="${TMP_DIR}/metadata-plugin-modernizer-main.zip"
HEADER_FILE="${TMP_DIR}/.last-headers"
ETAG_FILE="${TMP_DIR}/.etag"
EXTRACTED_DIR="${TMP_DIR}/metadata-plugin-modernizer-main"

# ── Dependency check ─────────────────────────────────────────────────────────
for cmd in curl unzip; do
    command -v "${cmd}" >/dev/null 2>&1 || { echo "[ERROR] '${cmd}' is required but not installed."; exit 1; }
done

# ── Cleanup trap: always remove ZIP and temp headers on exit ─────────────────
# The extracted directory is intentionally kept for the Transform stage.
cleanup() {
    rm -f "${ZIP_FILE}" "${HEADER_FILE}"
}
trap cleanup EXIT

# ── Prepare temp directory ───────────────────────────────────────────────────
mkdir -p "${TMP_DIR}"

# ── ETag-based incremental download ─────────────────────────────────────────
CURL_ARGS=(
    --silent
    --location
    --fail
    --output "${ZIP_FILE}"
    --dump-header "${HEADER_FILE}"
    --write-out "%{http_code}"
)

if [ -f "${ETAG_FILE}" ] && [ -d "${EXTRACTED_DIR}" ]; then
    STORED_ETAG=$(cat "${ETAG_FILE}")
    echo "[INFO] Found cached ETag: ${STORED_ETAG}"
    CURL_ARGS+=(--header "If-None-Match: ${STORED_ETAG}")
fi

CURL_ERR_FILE="${TMP_DIR}/.curl-stderr"
HTTP_CODE=$(curl "${CURL_ARGS[@]}" "${ZIP_URL}" 2>"${CURL_ERR_FILE}") || {
    CURL_ERR=$(cat "${CURL_ERR_FILE}" 2>/dev/null)
    echo "[WARN] curl failed: ${CURL_ERR:-unknown error}"
    HTTP_CODE="000"
}
rm -f "${CURL_ERR_FILE}"

if [ "${HTTP_CODE}" = "304" ]; then
    echo "[INFO] Data unchanged (HTTP 304) — reusing existing extracted data."
    # Fall through to validation of the existing extraction below.

elif [ "${HTTP_CODE}" = "200" ]; then
    echo "[INFO] Downloaded fresh data (HTTP 200)."

    # Extract the ETag from the response headers of THIS request (no race).
    NEW_ETAG=$(grep -i '^etag:' "${HEADER_FILE}" \
        | sed 's/^[eE][tT][aA][gG]: *//;s/[[:space:]]*$//' \
        | head -1)
    if [ -n "${NEW_ETAG}" ]; then
        echo "${NEW_ETAG}" > "${ETAG_FILE}"
        echo "[INFO] Saved ETag: ${NEW_ETAG}"
    else
        # No ETag in response (e.g. GitHub changed behaviour) — purge stale
        # cache so we never wrongly send If-None-Match on the next run.
        rm -f "${ETAG_FILE}"
        echo "[WARN] No ETag in response headers — cache disabled for this run."
    fi

    # Remove old extracted data before unzipping the fresh archive.
    rm -rf "${EXTRACTED_DIR}"

    unzip -q -o "${ZIP_FILE}" -d "${TMP_DIR}"
    echo "[INFO] Unzipped to ${EXTRACTED_DIR}"

    # Remove repo-metadata files that are not needed for transform.
    rm -rf "${EXTRACTED_DIR}/.github"
    rm -f  "${EXTRACTED_DIR}/.gitignore" \
           "${EXTRACTED_DIR}/README.md" \
           "${EXTRACTED_DIR}/requirements.txt" \
           "${EXTRACTED_DIR}/CONTRIBUTING.md" \
           "${EXTRACTED_DIR}/CODE_OF_CONDUCT.md" \
           "${EXTRACTED_DIR}/SECURITY.md"
    echo "[INFO] Cleaned up repository metadata files."

else
    echo "[ERROR] Unexpected HTTP code: ${HTTP_CODE}"
    if [ -d "${EXTRACTED_DIR}" ]; then
        echo "[WARN] Falling back to previously cached extraction."
    else
        echo "[ERROR] No cached extraction available — cannot continue."
        exit 1
    fi
fi

# ── Validate extracted content ───────────────────────────────────────────────
# Validate that summary.json exists and contains required keys so that
# upstream format changes are caught early and loudly.
echo "[INFO] Validating extracted data..."

SUMMARY_JSON="${EXTRACTED_DIR}/reports/summary.json"

if [ ! -f "${SUMMARY_JSON}" ]; then
    echo "[ERROR] Validation failed: reports/summary.json not found."
    exit 1
fi

# Validate that summary.json is valid JSON and contains required top-level keys.
REQUIRED_KEYS=("generatedOn" "totalMigrations" "failedMigrations" "successRate" "pullRequestStats" "failuresByRecipe" "pluginsWithFailures")
for key in "${REQUIRED_KEYS[@]}"; do
    if ! python3 -c "import json,sys; d=json.load(open(sys.argv[1])); assert sys.argv[2] in d" "${SUMMARY_JSON}" "${key}" 2>/dev/null; then
        echo "[ERROR] Validation failed: required key '${key}' not found in summary.json."
        echo "[ERROR] Upstream format may have changed — review the raw file:"
        head -30 "${SUMMARY_JSON}" >&2
        exit 1
    fi
done

if [ ! -d "${EXTRACTED_DIR}/reports/recipes" ] \
   || [ -z "$(ls -A "${EXTRACTED_DIR}/reports/recipes" 2>/dev/null)" ]; then
    echo "[ERROR] Validation failed: reports/recipes/ is missing or empty."
    exit 1
fi

# Check that at least one plugin directory with a reports/ sub-directory exists.
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
    echo "[ERROR] Validation failed: no plugin directories with a reports/ subdirectory found."
    exit 1
fi

echo "[INFO] Validation passed — ${PLUGIN_WITH_REPORTS} plugin(s) with reports found."
echo "[INFO] Data ready in ${EXTRACTED_DIR}"