#!/usr/bin/env node
/**
 * Builds public/data-sources/projects.json — a daily-cached snapshot of the
 * GitHub projects surfaced on the portfolio, across the owner's personal
 * account AND the orgs they own. The site reads this static file instead of
 * hitting the GitHub API from the browser, so project pages never blank out on
 * unauthenticated rate limits (HTTP 403).
 *
 * Run locally:  GITHUB_TOKEN=$(gh auth token) node scripts/build-project-snapshot.mjs
 * In CI:        GITHUB_TOKEN is the Action's built-in token. It can read all
 *               PUBLIC repos below (public data is readable by any token);
 *               private repos are never included.
 *
 * Curation is explicit and editable:
 *   OWNERS   — personal account + owned orgs worth surfacing (SAP is excluded:
 *              membership, not ownership).
 *   FEATURED — landing-page "Selected Work" OSS projects.
 *   EXCLUDE  — repos hidden from the index (personal/family/template/POC/infra).
 * Everything else that is public, recent, and has a real description is kept.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const OUT = fileURLToPath(new URL("../public/data-sources/projects.json", import.meta.url));

// Personal account + owned orgs. `label` groups them in the /projects index.
const OWNERS = [
  { login: "punitmishra", type: "user", label: "Personal" },
  { login: "calipercad", type: "org", label: "CaliperCAD" },
  { login: "ohmforge", type: "org", label: "OhmForge" },
  { login: "termling", type: "org", label: "Termling" },
  { login: "orgolabs", type: "org", label: "Orgolabs" },
  { login: "greplabs", type: "org", label: "GrepLabs" },
  { login: "grepcoin", type: "org", label: "GrepCoin" },
];

// Landing-page "Selected Work" OSS projects (personal account), in this order.
const FEATURED = ["coviber", "vaultic", "shield-ai", "railroad-arcade", "esp32-firmware", "pi-race"];

// Hidden from the index: meta/self, private & family infra, spouse/family
// sites, templates/starters/scratch, exercises, POCs, org landing pages & taps.
const EXCLUDE = new Set([
  "punitmishra", "punitmishra.github.io", ".github",
  "job-search", "openclaw-home", "immich-stack", "airbook", "airbook-bootstrap", "pi-setup",
  "sm-home", "sm-universe", "sm-blog", "sm-photography", "portfolio-sm", "madhu-portfolio",
  "shubsmishra-blog", "homepage", "mrpepper", "dog-verse-frontend", "dog-backend", "clickart",
  "github-slideshow", "admin-one-vue-tailwind", "virtual-event-starter-kit", "commerce-nextjs",
  "nextjs-ai-chatbot", "next-news", "next-news-2", "md-test", "data0ctopus", "chaos-unleashed",
  "eminent", "greplabs-internal", "themishra-apps", "poop-fan-404", "istio-workshop", "hippo",
  "technical-ex", "sap-cxii-tech-ex-01", "sap-cxii-tech-ex-02", "chem-ai", "color-mix",
  "model-railroad-ui", "trollmind", "homebrew-vaultic", "scout", "pipeline-defense",
  // org infra / landing pages / taps / scratch
  "demo-repository", "shared", "lab-playbook", "homebrew-termling", "thelabs", "ops",
  "orgolabs.github.io", "calipercad.github.io", "termling.github.io", "greplabs.github.io",
]);

const AGE_MIN = "2024-01-01"; // drop ancient/abandoned repos
const ACTIVE_DAYS = 60; // "actively being worked on" window
const PER_OWNER_CAP = 12; // cap per owner so featured repos don't crowd out the rest

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "punitmishra-portfolio-snapshot",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json();
}
async function ghSafe(path) {
  try {
    return await gh(path);
  } catch {
    return null;
  }
}

async function reposFor(owner) {
  const base =
    owner.type === "org"
      ? `/orgs/${owner.login}/repos?type=public`
      : `/users/${owner.login}/repos?type=owner`;
  const out = [];
  for (let page = 1; page < 6; page++) {
    const batch = await gh(`${base}&per_page=100&page=${page}&sort=pushed`);
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

function cleanHomepage(url) {
  // Respect the site-wide "no Vercel" rule — never surface preview URLs.
  if (!url || /vercel\.app/i.test(url)) return "";
  return url;
}

const now = Date.now();
const isActive = (pushedAt) => now - new Date(pushedAt).getTime() < ACTIVE_DAYS * 864e5;

let totalStars = 0;
const allRepos = [];

for (const owner of OWNERS) {
  const repos = await reposFor(owner);
  const sources = repos.filter((r) => !r.fork && !r.archived && !r.private);
  totalStars += sources.reduce((s, r) => s + (r.stargazers_count || 0), 0);

  const featuredHere = owner.type === "user" ? FEATURED : [];
  const keep = sources
    .filter(
      (r) =>
        !EXCLUDE.has(r.name) &&
        (r.pushed_at || "") >= AGE_MIN &&
        (featuredHere.includes(r.name) || (r.description || "").trim().length >= 12)
    )
    .sort((a, b) => {
      const fa = featuredHere.indexOf(a.name);
      const fb = featuredHere.indexOf(b.name);
      if (fa !== -1 || fb !== -1) {
        if (fa === -1) return 1;
        if (fb === -1) return -1;
        return fa - fb;
      }
      if ((b.stargazers_count || 0) !== (a.stargazers_count || 0)) {
        return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      }
      return (b.pushed_at || "").localeCompare(a.pushed_at || "");
    })
    .slice(0, PER_OWNER_CAP);

  for (const r of keep) {
    const rel = await ghSafe(`/repos/${owner.login}/${r.name}/releases/latest`);
    const commits = (await ghSafe(`/repos/${owner.login}/${r.name}/commits?per_page=5`)) || [];
    allRepos.push({
      slug: r.name,
      name: r.name,
      owner: owner.login,
      ownerLabel: owner.label,
      ownerType: owner.type,
      description: r.description || "",
      language: r.language || "",
      topics: r.topics || [],
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      url: r.html_url,
      homepage: cleanHomepage(r.homepage),
      pushedAt: (r.pushed_at || "").slice(0, 10),
      active: isActive(r.pushed_at),
      featured: owner.type === "user" && FEATURED.includes(r.name),
      release: rel
        ? {
            tag: rel.tag_name,
            name: rel.name || rel.tag_name,
            date: (rel.published_at || "").slice(0, 10),
            url: rel.html_url,
          }
        : null,
      commits: commits.map((c) => ({
        sha: (c.sha || "").slice(0, 7),
        message: (c.commit?.message || "").split("\n")[0],
        date: (c.commit?.author?.date || "").slice(0, 10),
        url: c.html_url,
      })),
    });
  }
}

const profile = await ghSafe(`/users/punitmishra`);
const owners = OWNERS.map((o) => ({
  login: o.login,
  label: o.label,
  type: o.type,
  count: allRepos.filter((r) => r.owner === o.login).length,
})).filter((o) => o.count > 0);

const data = {
  generated: new Date().toISOString(),
  profile: {
    publicRepos: profile?.public_repos ?? 0,
    followers: profile?.followers ?? 0,
    totalStars,
  },
  owners,
  repos: allRepos,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
console.log(
  `Wrote ${allRepos.length} repos across ${owners.length} owners → projects.json ` +
    `(${allRepos.filter((r) => r.active).length} active, ${totalStars}★ personal)`
);
