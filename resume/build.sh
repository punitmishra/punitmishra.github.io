#!/usr/bin/env bash
# Build resume PDFs from the shared resume-content.tex via Tectonic.
#   resume.tex        -> ../public/resume.pdf         (1-page, primary)
#   resume-2page.tex  -> ../public/resume-2page.pdf   (2-page, detailed)
#
# The .tex uses a CONTACT_EMAIL token so the address isn't committed in
# plaintext to the source. Override via env: RESUME_EMAIL=you@example.com ./build.sh
set -euo pipefail
cd "$(dirname "$0")"

EMAIL="${RESUME_EMAIL:-punit.mishra09@gmail.com}"
PUBLIC="${PUBLIC_DIR:-../public}"
mkdir -p "$PUBLIC"

build_one() {
  local driver="$1" out="$2"
  local tmp; tmp="$(mktemp -d)"
  # Copy sources, substitute the email token in the shared content file
  cp "$driver" "$tmp/"
  sed "s|CONTACT_EMAIL|${EMAIL}|g; s|CONTACT\\\\_EMAIL|${EMAIL}|g" resume-content.tex > "$tmp/resume-content.tex"
  tectonic --outdir "$tmp" "$tmp/$driver" >/dev/null 2>&1
  cp "$tmp/${driver%.tex}.pdf" "$PUBLIC/$out"
  echo "Built $PUBLIC/$out ($(du -h "$PUBLIC/$out" | cut -f1))"
  rm -rf "$tmp"
}

build_one resume.tex       resume.pdf
build_one resume-2page.tex resume-2page.pdf
echo "Email embedded: $EMAIL"
