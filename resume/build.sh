#!/usr/bin/env bash
# Build resume PDFs from the shared resume-content.tex via Tectonic.
# Produces a 1-page (concise) and a multi-page (detailed) version PER LOCATION:
#   Bay Area  -> ../public/resume.pdf            + resume-2page.pdf
#   New York  -> ../public/resume-newyork.pdf    + resume-2page-newyork.pdf
#
# Tokens substituted at build time (kept out of committed source):
#   CONTACT_EMAIL  <- $RESUME_EMAIL   (default punit.mishra09@gmail.com)
#   RESUMELOCATION <- per-location loop below
set -euo pipefail
cd "$(dirname "$0")"

EMAIL="${RESUME_EMAIL:-punit.mishra09@gmail.com}"
PUBLIC="${PUBLIC_DIR:-../public}"
mkdir -p "$PUBLIC"

# "Location|filename-suffix" — add rows here for more location-tailored versions.
LOCATIONS=(
  "Bay Area, CA|"
  "New York, NY|-newyork"
)

build_one() {
  local driver="$1" out="$2" location="$3"
  local tmp; tmp="$(mktemp -d)"
  cp "$driver" "$tmp/"
  sed "s|CONTACT_EMAIL|${EMAIL}|g; s|CONTACT\\\\_EMAIL|${EMAIL}|g; s|RESUMELOCATION|${location}|g" \
    resume-content.tex > "$tmp/resume-content.tex"
  tectonic --outdir "$tmp" "$tmp/$driver" >/dev/null 2>&1
  cp "$tmp/${driver%.tex}.pdf" "$PUBLIC/$out"
  echo "Built $PUBLIC/$out ($(du -h "$PUBLIC/$out" | cut -f1)) — $location"
  rm -rf "$tmp"
}

# Standalone variants — content lives inline in the driver (no shared content
# include), so we sed the driver itself. Built once at the Bay Area location.
build_standalone() {
  local driver="$1" out="$2" location="$3"
  local tmp; tmp="$(mktemp -d)"
  sed "s|CONTACT_EMAIL|${EMAIL}|g; s|CONTACT\\\\_EMAIL|${EMAIL}|g; s|RESUMELOCATION|${location}|g" \
    "$driver" > "$tmp/$driver"
  tectonic --outdir "$tmp" "$tmp/$driver" >/dev/null 2>&1
  cp "$tmp/${driver%.tex}.pdf" "$PUBLIC/$out"
  echo "Built $PUBLIC/$out ($(du -h "$PUBLIC/$out" | cut -f1)) — $location"
  rm -rf "$tmp"
}

for row in "${LOCATIONS[@]}"; do
  loc="${row%%|*}"; sfx="${row##*|}"
  build_one resume.tex       "resume${sfx}.pdf"        "$loc"
  build_one resume-2page.tex "resume-2page${sfx}.pdf"  "$loc"
done

# Alternate framings (Bay Area only) — academic/CV and business-impact.
build_standalone resume-academic.tex "resume-academic.pdf" "Bay Area, CA"
build_standalone resume-business.tex "resume-business.pdf" "Bay Area, CA"

echo "Email embedded: $EMAIL"
