#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define source and target directories relative to the script location
SOURCE_DIR="$(dirname "$SOURCE_DIR")"

# Define the target directory's relative path
RELATIVE_TARGET_DIR="../../rollyourown/web/src/zkp"

# Ensure the target directory exists before normalizing the path
mkdir -p "${SOURCE_DIR}/${RELATIVE_TARGET_DIR}"
# Use realpath or readlink to normalize the target directory path
# Check if realpath is available, otherwise use readlink -f
if command -v realpath &> /dev/null; then
    TARGET_DIR=$(realpath "${SOURCE_DIR}/../../rollyourown/web/src/zkp")
else
    TARGET_DIR=$(readlink -f "${SOURCE_DIR}/../../rollyourown/web/src/zkp")
fi

# Files to copy
FILES=("trade.wasm" "trade.zkey")

# Echo paths for debugging
echo "Script Directory: $SCRIPT_DIR"
echo "Target Directory: $TARGET_DIR"
echo "Source Directory: $SOURCE_DIR"

# Copy each file, overwriting if necessary
for file in "${FILES[@]}"; do
  if cp "${SOURCE_DIR}/TRADE/${file}" "${TARGET_DIR}/"; then
    echo "Copied ${file} to ${TARGET_DIR}/"
  else
    echo "Failed to copy ${file}"
  fi
done
