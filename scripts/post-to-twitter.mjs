#!/usr/bin/env node

/**
 * Twitter/X Article Poster
 *
 * Usage:
 *   node scripts/post-to-twitter.js --slug article-slug
 *   node scripts/post-to-twitter.js --daily-update
 *
 * Setup:
 * 1. Create a Twitter Developer account: https://developer.twitter.com
 * 2. Create an app and get your API keys
 * 3. Set environment variables in .env.local:
 *    - TWITTER_API_KEY
 *    - TWITTER_API_SECRET
 *    - TWITTER_ACCESS_TOKEN
 *    - TWITTER_ACCESS_SECRET
 *
 * Twitter/X Profile: https://twitter.com/punitmishra
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '../public/content/blog');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 ? args[index + 1] : null;
};

const slug = getArg('slug');
const dailyUpdate = args.includes('--daily-update');
const dryRun = args.includes('--dry-run');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  tweet: (msg) => console.log(`${colors.cyan}🐦${colors.reset} ${msg}`),
};

// Parse frontmatter
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

// Format article as tweet
function formatArticleTweet(article) {
  const url = `https://punitmishra.github.io/blog/${article.slug}`;

  // Clean hashtags
  const hashtags = (article.tags || [])
    .slice(0, 3)
    .map(tag => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`)
    .join(' ');

  // Calculate available space for title
  const fixedLength = 6 + 4 + url.length + hashtags.length; // emoji + spaces + url + hashtags
  const maxTitleLength = 280 - fixedLength;

  const title = article.title.length > maxTitleLength
    ? article.title.slice(0, maxTitleLength - 3) + '...'
    : article.title;

  return [
    `📝 ${title}`,
    '',
    hashtags,
    '',
    `🔗 ${url}`,
  ].join('\n');
}

// Format daily update tweet
function formatDailyUpdate() {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

  // Read blog index for stats
  const indexPath = path.join(BLOG_DIR, 'index.json');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  const totalArticles = index.articles.length;
  const recentArticles = index.articles.filter(a => {
    const articleDate = new Date(a.date);
    const daysDiff = (today - articleDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  }).length;

  const categories = [...new Set(index.articles.map(a => a.category))];

  return [
    `🚀 ${dayName} Engineering Update`,
    '',
    `📊 Blog Stats:`,
    `• ${totalArticles} technical articles`,
    `• ${recentArticles} new this week`,
    `• Topics: ${categories.slice(0, 3).join(', ')}`,
    '',
    `💡 Latest: AI/ML, Systems, Rust`,
    '',
    `🔗 punitmishra.github.io`,
    '',
    `#SoftwareEngineering #Tech`,
  ].join('\n');
}

// OAuth 1.0a signature generation (simplified)
function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&');

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  return crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64');
}

// Post tweet (requires Twitter API v2)
async function postTweet(text, credentials) {
  if (dryRun) {
    log.warn('Dry run - tweet not actually posted');
    return { success: true, dry_run: true };
  }

  const { apiKey, apiSecret, accessToken, accessSecret } = credentials;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error('Missing Twitter API credentials. Set environment variables.');
  }

  const url = 'https://api.twitter.com/2/tweets';

  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  oauthParams.oauth_signature = generateOAuthSignature(
    'POST',
    url,
    oauthParams,
    apiSecret,
    accessSecret
  );

  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  return response.json();
}

// Main function
async function main() {
  console.log(`
╭────────────────────────────────────────────╮
│  ${colors.bold}Twitter/X Poster${colors.reset}                           │
│  ${colors.dim}https://twitter.com/punitmishra${colors.reset}             │
╰────────────────────────────────────────────╯
`);

  let tweetText;

  if (dailyUpdate) {
    log.info('Generating daily update tweet...');
    tweetText = formatDailyUpdate();
  } else if (slug) {
    // Read article
    const articlePath = path.join(BLOG_DIR, `${slug}.md`);
    if (!fs.existsSync(articlePath)) {
      log.error(`Article not found: ${slug}.md`);
      process.exit(1);
    }

    log.info(`Reading article: ${slug}.md`);
    const content = fs.readFileSync(articlePath, 'utf-8');
    const { frontmatter } = parseFrontmatter(content);

    tweetText = formatArticleTweet({
      slug,
      title: frontmatter.title,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    });
  } else {
    log.error('No action specified');
    console.log(`\n  Usage:`);
    console.log(`    node scripts/post-to-twitter.js --slug <article-slug>`);
    console.log(`    node scripts/post-to-twitter.js --daily-update`);
    console.log(`    Add --dry-run to preview without posting\n`);
    process.exit(1);
  }

  // Display tweet preview
  console.log(`\n${colors.dim}┌${'─'.repeat(50)}┐${colors.reset}`);
  tweetText.split('\n').forEach(line => {
    console.log(`${colors.dim}│${colors.reset} ${line.padEnd(48)} ${colors.dim}│${colors.reset}`);
  });
  console.log(`${colors.dim}└${'─'.repeat(50)}┘${colors.reset}`);
  console.log(`${colors.dim}  ${tweetText.length}/280 characters${colors.reset}\n`);

  if (dryRun) {
    log.warn('Dry run mode - tweet not posted');
    return;
  }

  // Get credentials from environment
  const credentials = {
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  };

  if (!credentials.apiKey) {
    log.error('Twitter API credentials not found');
    console.log(`\n  Set these environment variables:`);
    console.log(`    TWITTER_API_KEY`);
    console.log(`    TWITTER_API_SECRET`);
    console.log(`    TWITTER_ACCESS_TOKEN`);
    console.log(`    TWITTER_ACCESS_SECRET\n`);
    process.exit(1);
  }

  log.info('Posting to Twitter/X...');

  try {
    const result = await postTweet(tweetText, credentials);

    if (result.data) {
      log.success('Tweet posted successfully!');
      console.log(`\n  ${colors.green}Tweet ID:${colors.reset} ${result.data.id}\n`);
    } else {
      log.error(`Failed: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    log.error(`Error: ${error.message}`);
  }
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
