---
title: "Automating Twitter Posts with GitHub Actions"
date: "2025-01-17"
category: "Technical"
tags: ["GitHub Actions", "Twitter", "Automation", "DevOps", "CI/CD"]
readTime: "12 min read"
featured: true
---

# Automating Twitter Posts with GitHub Actions

Every time I publish a new blog article, I want it automatically shared on Twitter. No manual copying, no forgetting to post. Here's how I built a GitHub Actions workflow that posts to Twitter whenever I push new content.

## The Goal

When I push a new Markdown article to my blog:
1. Detect the new/changed article
2. Extract title and tags from frontmatter
3. Format a tweet with hashtags and link
4. Post to Twitter/X automatically

## Prerequisites

You'll need:
- A Twitter Developer account
- API keys with read/write access
- A GitHub repository for your blog

## Step 1: Get Twitter API Credentials

1. Go to [developer.twitter.com](https://developer.twitter.com/en/portal/projects)
2. Create a new project and app
3. Generate these 4 credentials:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret

Make sure your app has **Read and Write** permissions.

## Step 2: Add Secrets to GitHub

Go to your repository's **Settings > Secrets and variables > Actions** and add:

| Secret Name | Description |
|-------------|-------------|
| `TWITTER_API_KEY` | Your API Key |
| `TWITTER_API_SECRET` | Your API Secret |
| `TWITTER_ACCESS_TOKEN` | Your Access Token |
| `TWITTER_ACCESS_SECRET` | Your Access Token Secret |

## Step 3: Create the Workflow

Create `.github/workflows/twitter-post.yml`:

```yaml
name: Post to Twitter/X

on:
  # Trigger when blog articles change
  push:
    branches: [main]
    paths:
      - 'public/content/blog/*.md'
      - 'public/content/blog/index.json'

  # Manual trigger from GitHub UI
  workflow_dispatch:
    inputs:
      article_slug:
        description: 'Article slug to post'
        required: true
        type: string
      dry_run:
        description: 'Preview only, no actual post'
        required: false
        type: boolean
        default: false

jobs:
  post-tweet:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 2  # Need previous commit to detect changes

      - name: Detect new articles
        id: detect
        if: github.event_name == 'push'
        run: |
          # Get changed markdown files
          CHANGED=$(git diff --name-only HEAD~1 HEAD -- 'public/content/blog/*.md' | head -1)
          if [ -n "$CHANGED" ]; then
            SLUG=$(basename "$CHANGED" .md)
            echo "slug=$SLUG" >> $GITHUB_OUTPUT
            echo "found=true" >> $GITHUB_OUTPUT
          else
            echo "found=false" >> $GITHUB_OUTPUT
          fi

      - name: Set article slug
        id: article
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            echo "slug=${{ github.event.inputs.article_slug }}" >> $GITHUB_OUTPUT
            echo "dry_run=${{ github.event.inputs.dry_run }}" >> $GITHUB_OUTPUT
          else
            echo "slug=${{ steps.detect.outputs.slug }}" >> $GITHUB_OUTPUT
            echo "dry_run=false" >> $GITHUB_OUTPUT
          fi

      - name: Read article metadata
        id: metadata
        if: steps.detect.outputs.found == 'true' || github.event_name == 'workflow_dispatch'
        run: |
          SLUG="${{ steps.article.outputs.slug }}"
          ARTICLE_PATH="public/content/blog/${SLUG}.md"

          # Extract title from frontmatter
          TITLE=$(grep -m1 '^title:' "$ARTICLE_PATH" | sed 's/title: *["'"'"']\{0,1\}\([^"'"'"']*\)["'"'"']\{0,1\}/\1/')

          # Extract tags
          TAGS=$(grep -m1 '^tags:' "$ARTICLE_PATH" | sed 's/tags: *\[//' | sed 's/\]//' | tr -d '"' | tr ',' '\n' | head -3 | tr '\n' ' ')

          echo "title=$TITLE" >> $GITHUB_OUTPUT
          echo "tags=$TAGS" >> $GITHUB_OUTPUT

      - name: Format tweet
        id: tweet
        run: |
          SLUG="${{ steps.article.outputs.slug }}"
          TITLE="${{ steps.metadata.outputs.title }}"
          TAGS="${{ steps.metadata.outputs.tags }}"
          URL="https://punitmishra.github.io/blog/${SLUG}"

          # Format hashtags
          HASHTAGS=$(echo "$TAGS" | tr ' ' '\n' | grep -v '^$' | sed 's/[^a-zA-Z0-9]//g' | sed 's/^/#/' | tr '\n' ' ')

          # Build tweet
          TWEET="📝 ${TITLE}

${HASHTAGS}

🔗 ${URL}"

          echo "$TWEET" > tweet.txt
          echo "Tweet preview:"
          cat tweet.txt

      - name: Post to Twitter/X
        if: steps.article.outputs.dry_run != 'true'
        env:
          TWITTER_API_KEY: ${{ secrets.TWITTER_API_KEY }}
          TWITTER_API_SECRET: ${{ secrets.TWITTER_API_SECRET }}
          TWITTER_ACCESS_TOKEN: ${{ secrets.TWITTER_ACCESS_TOKEN }}
          TWITTER_ACCESS_SECRET: ${{ secrets.TWITTER_ACCESS_SECRET }}
        run: |
          # OAuth 1.0a authentication
          TWEET=$(cat tweet.txt)
          TIMESTAMP=$(date +%s)
          NONCE=$(openssl rand -hex 16)

          # Create OAuth signature
          BASE_URL="https://api.twitter.com/2/tweets"
          # ... OAuth signature generation ...

          # Post using curl
          curl -X POST "$BASE_URL" \
            -H "Authorization: OAuth ..." \
            -H "Content-Type: application/json" \
            -d "{\"text\": $(echo "$TWEET" | jq -Rs .)}"
```

## Understanding the Workflow

### Trigger Conditions

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'public/content/blog/*.md'
```

The workflow only runs when:
- Push is to `main` branch
- Changes include Markdown files in the blog directory

This prevents unnecessary runs for unrelated changes.

### Detecting New Articles

```bash
git diff --name-only HEAD~1 HEAD -- 'public/content/blog/*.md'
```

This compares the current commit with the previous one to find changed Markdown files.

### Extracting Metadata

```bash
TITLE=$(grep -m1 '^title:' "$ARTICLE_PATH" | sed 's/title: *["'"'"']\{0,1\}\([^"'"'"']*\)["'"'"']\{0,1\}/\1/')
```

Parses YAML frontmatter to extract the article title and tags.

### OAuth 1.0a for Twitter API

Twitter's API v2 requires OAuth 1.0a authentication. The workflow:
1. Generates a timestamp and nonce
2. Creates the signature base string
3. Signs with HMAC-SHA1
4. Builds the Authorization header

## Testing with Dry Run

You can test without actually posting:

1. Go to **Actions** tab in your repo
2. Select "Post to Twitter/X"
3. Click "Run workflow"
4. Enter an article slug
5. Check "Dry run"
6. View the output to see the tweet preview

## Daily Digest Variation

Want a daily summary instead of per-article posts? Create a scheduled workflow:

```yaml
name: Daily Twitter Digest

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC daily

jobs:
  daily-digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Get recent articles
        run: |
          # Find articles from last 24 hours
          find public/content/blog -name "*.md" -mtime -1
```

## Troubleshooting

### "401 Unauthorized"
- Verify all 4 secrets are correctly set
- Check app permissions include "Read and Write"
- Regenerate tokens if needed

### "No articles detected"
- Ensure you're pushing to `main` branch
- Check that paths match your blog structure
- Verify the article has valid frontmatter

### Rate Limits
Twitter API v2 has limits:
- 200 tweets per 15 minutes
- 1,500 tweets per month (free tier)

For a blog, you'll never hit these limits.

## Alternative: Use a Twitter Action

If OAuth is too complex, use a pre-built action:

```yaml
- name: Tweet
  uses: snow-actions/tweet@v1
  with:
    status: "New article: ${{ steps.metadata.outputs.title }}"
  env:
    CONSUMER_API_KEY: ${{ secrets.TWITTER_API_KEY }}
    CONSUMER_API_SECRET_KEY: ${{ secrets.TWITTER_API_SECRET }}
    ACCESS_TOKEN: ${{ secrets.TWITTER_ACCESS_TOKEN }}
    ACCESS_TOKEN_SECRET: ${{ secrets.TWITTER_ACCESS_SECRET }}
```

## Results

Now whenever I push a new article:
- GitHub Actions automatically detects it
- Extracts the title and tags
- Posts a formatted tweet with hashtags
- No manual intervention required

This saves time and ensures consistent promotion of new content.

---

*Automation is about eliminating friction. The less I have to think about promotion, the more I can focus on writing.*
