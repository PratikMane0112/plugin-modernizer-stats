#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

cleanup() {
    echo "[INFO] Cleaning up .tmp…"
    rm -rf "${PROJECT_ROOT}/.tmp"
    echo "================================================" 
    echo "[INFO] Metadata fetched successfully..."
    echo "================================================"
}
trap cleanup EXIT

echo "================================================"
echo "==> Step : Fetching metadata…"
echo "================================================"
bash "${SCRIPT_DIR}/fetch-metadata-plugin-modernizer.sh"


echo "================================================"
echo "==> Step : Consolidating report…"
echo "================================================"
INPUT_DIR=.tmp/metadata-plugin-modernizer-main \
OUTPUT_DIR=public/plugin-modernizer-stats \
python3 "${SCRIPT_DIR}/consolidate.py"
