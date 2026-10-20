#!/usr/bin/env bash
set -euo pipefail

# Prepare a public-only static artifact. This does not publish or deploy it.
if [[ $# -ne 1 ]]; then
  echo "usage: $0 NEW_OUTPUT_DIRECTORY" >&2
  exit 2
fi

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
output_dir="$1"

if [[ -e "$output_dir" ]]; then
  echo "refusing to overwrite existing output directory: $output_dir" >&2
  exit 1
fi

public_files=(
  index.html
  about.html
  privacy.html
  terms.html
  assets/omnibioai-logo.svg
  assets/omnibioai-mark.svg
  assets/omnibioai-studio-qr.svg
  assets/praveen_photo.jpg
  assets/rajnish_kumar.jpg
  data/site-data.json
)

for relative_path in "${public_files[@]}"; do
  if [[ ! -f "$repo_root/$relative_path" ]]; then
    echo "required public file is missing: $relative_path" >&2
    exit 1
  fi
done

mkdir -p -- "$output_dir"
for relative_path in "${public_files[@]}"; do
  mkdir -p -- "$output_dir/$(dirname -- "$relative_path")"
  cp -- "$repo_root/$relative_path" "$output_dir/$relative_path"
done

if [[ -e "$output_dir/admin.html" ]]; then
  echo "public artifact unexpectedly contains admin.html" >&2
  exit 1
fi

printf 'Public static artifact prepared at %s\n' "$output_dir"
printf 'Files included: %s\n' "${#public_files[@]}"
