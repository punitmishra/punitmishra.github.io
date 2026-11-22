// Loads the daily-cached project snapshot (public/data-sources/projects.json)
// once and shares it across views. The snapshot is produced by
// scripts/build-project-snapshot.mjs via a daily GitHub Action, so the site
// never calls the GitHub API from the browser (no 403 rate-limit blanks).
import axios from "axios";

const EMPTY = { generated: "", profile: {}, owners: [], repos: [] };

let cache = null;
let inflight = null;

export async function loadProjects() {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = axios
    .get(`${import.meta.env.BASE_URL}data-sources/projects.json`)
    .then((res) => {
      cache = res.data && Array.isArray(res.data.repos) ? res.data : EMPTY;
      return cache;
    })
    .catch(() => {
      cache = EMPTY;
      return cache;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

// Find a repo by slug, preferring the personal account when slugs collide.
export function repoBySlug(data, slug) {
  const matches = (data.repos || []).filter((r) => r.slug === slug);
  return matches.find((r) => r.owner === "punitmishra") || matches[0] || null;
}
