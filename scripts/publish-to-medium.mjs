#!/usr/bin/env node

/**
 * Medium Article Publisher
 *
 * Usage:
 *   node scripts/publish-to-medium.js --slug article-slug --token YOUR_MEDIUM_TOKEN
 *
 * Get your Medium Integration Token from:
 *   https://medium.com/me/settings (scroll to Integration tokens)
 *
 * Medium Profile: https://medium.com/@punitmishra
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '../public/content/blog');
const MEDIUM_API = 'https://api.medium.com/v1';

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 ? args[index + 1] : null;
};

const slug = getArg('slug');
const token = getArg('token') || process.env.MEDIUM_TOKEN;
const dryRun = args.includes('--dry-run');
const listAll = args.includes('--list');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  dim: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`),
};

// Parse frontmatter from markdown
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  match[1].split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      let value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      }
      frontmatter[key.trim()] = value;
    }
  });

  return { frontmatter, body: match[2] };
}

// Get Medium user info
async function getMediumUser(token) {
  const response = await fetch(`${MEDIUM_API}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

// Publish to Medium
async function publishToMedium(token, userId, article) {
  const response = await fetch(`${MEDIUM_API}/users/${userId}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: article.title,
      contentFormat: 'markdown',
      content: article.content,
      tags: article.tags.slice(0, 5), // Medium allows max 5 tags
      publishStatus: dryRun ? 'draft' : 'public',
      canonicalUrl: `https://punitmishra.github.io/blog/${article.slug}`,
      license: 'all-rights-reserved',
    }),
  });
  return response.json();
}

// List available articles
function listArticles() {
  console.log(`\n${colors.bold}Available Articles:${colors.reset}\n`);

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

  files.forEach(file => {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const { frontmatter } = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    console.log(`  ${colors.green}${slug}${colors.reset}`);
    console.log(`  ${colors.dim}├─ ${frontmatter.title || 'Untitled'}${colors.reset}`);
    console.log(`  ${colors.dim}├─ ${frontmatter.date || 'No date'}${colors.reset}`);
    console.log(`  ${colors.dim}└─ ${(frontmatter.tags || []).join(', ')}${colors.reset}\n`);
  });
}

// Main publish function
async function main() {
  console.log(`
╭────────────────────────────────────────────╮
│  ${colors.bold}Medium Article Publisher${colors.reset}                  │
│  ${colors.dim}https://medium.com/@punitmishra${colors.reset}            │
╰────────────────────────────────────────────╯
`);

  if (listAll) {
    listArticles();
    return;
  }

  if (!slug) {
    log.error('No article slug provided');
    console.log(`\n  Usage: node scripts/publish-to-medium.js --slug <article-slug> --token <token>`);
    console.log(`  List articles: node scripts/publish-to-medium.js --list\n`);
    process.exit(1);
  }

  if (!token) {
    log.error('No Medium token provided');
    console.log(`\n  Get your token from: https://medium.com/me/settings\n`);
    process.exit(1);
  }

  // Read article
  const articlePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(articlePath)) {
    log.error(`Article not found: ${slug}.md`);
    process.exit(1);
  }

  log.info(`Reading article: ${slug}.md`);
  const content = fs.readFileSync(articlePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  // Format for Medium
  const article = {
    slug,
    title: frontmatter.title,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    content: `# ${frontmatter.title}\n\n${body}\n\n---\n\n*Originally published at [punitmishra.github.io](https://punitmishra.github.io/blog/${slug})*`,
  };

  log.info(`Title: ${article.title}`);
  log.info(`Tags: ${article.tags.join(', ')}`);

  if (dryRun) {
    log.warn('Dry run mode - will publish as draft');
  }

  // Get user info
  log.info('Authenticating with Medium...');
  const user = await getMediumUser(token);

  if (user.errors) {
    log.error(`Authentication failed: ${user.errors[0].message}`);
    process.exit(1);
  }

  log.success(`Authenticated as: ${user.data.name} (@${user.data.username})`);

  // Publish
  log.info('Publishing to Medium...');
  const result = await publishToMedium(token, user.data.id, article);

  if (result.errors) {
    log.error(`Publish failed: ${result.errors[0].message}`);
    process.exit(1);
  }

  log.success('Article published successfully!');
  console.log(`\n  ${colors.green}URL:${colors.reset} ${result.data.url}\n`);
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
