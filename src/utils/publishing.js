/**
 * Publishing Integrations for Medium and Twitter/X
 *
 * Setup:
 * 1. Get Medium Integration Token: https://medium.com/me/settings (Integration tokens)
 * 2. Get Twitter API keys: https://developer.twitter.com/en/portal/dashboard
 *
 * Environment variables (set in .env.local):
 * - VITE_MEDIUM_TOKEN: Medium integration token
 * - VITE_TWITTER_API_KEY: Twitter API key
 * - VITE_TWITTER_API_SECRET: Twitter API secret
 * - VITE_TWITTER_ACCESS_TOKEN: Twitter access token
 * - VITE_TWITTER_ACCESS_SECRET: Twitter access token secret
 */

// Medium API Integration
export const MediumPublisher = {
  baseUrl: 'https://api.medium.com/v1',

  async getUser(token) {
    const response = await fetch(`${this.baseUrl}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  async publishPost(token, userId, article) {
    const response = await fetch(`${this.baseUrl}/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: article.title,
        contentFormat: 'markdown',
        content: article.content,
        tags: article.tags || [],
        publishStatus: article.draft ? 'draft' : 'public',
        canonicalUrl: article.canonicalUrl,
        license: 'all-rights-reserved',
      }),
    });
    return response.json();
  },

  formatArticleForMedium(article) {
    // Add header image and formatting
    let content = `# ${article.title}\n\n`;

    if (article.excerpt) {
      content += `*${article.excerpt}*\n\n---\n\n`;
    }

    content += article.body;

    // Add footer with canonical link
    content += `\n\n---\n\n*Originally published at [punitmishra.com](https://punitmishra.github.io/blog/${article.slug})*`;

    return {
      ...article,
      content,
      canonicalUrl: `https://punitmishra.github.io/blog/${article.slug}`,
    };
  },
};

// Twitter/X API Integration
export const TwitterPublisher = {
  async postTweet(credentials, text, mediaIds = []) {
    // Note: Twitter API v2 requires OAuth 1.0a or OAuth 2.0
    // This is a simplified client-side example
    // For production, use a server-side implementation

    const tweetData = {
      text: text.slice(0, 280), // Twitter character limit
    };

    if (mediaIds.length > 0) {
      tweetData.media = { media_ids: mediaIds };
    }

    // In production, this should go through a backend proxy
    // that handles OAuth authentication
    console.log('Tweet would be posted:', tweetData);
    return { success: true, data: tweetData };
  },

  formatArticleTweet(article) {
    const hashtags = article.tags
      .slice(0, 3)
      .map(tag => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`)
      .join(' ');

    const url = `https://punitmishra.github.io/blog/${article.slug}`;

    // Format: Title + hashtags + URL (fitting within 280 chars)
    const maxTitleLength = 280 - hashtags.length - url.length - 10;
    const title = article.title.length > maxTitleLength
      ? article.title.slice(0, maxTitleLength - 3) + '...'
      : article.title;

    return `📝 ${title}\n\n${hashtags}\n\n🔗 ${url}`;
  },

  formatDailyUpdate(stats) {
    const updates = [
      `🚀 Daily Update`,
      ``,
      `📊 Stats:`,
      `• ${stats.visitors || 0} visitors`,
      `• ${stats.pageViews || 0} page views`,
      `• ${stats.newArticles || 0} new articles`,
      ``,
      `🔗 punitmishra.github.io`,
      ``,
      `#SoftwareEngineering #AI #WebDev`,
    ];

    return updates.join('\n');
  },
};

// Unified Publishing Service
export const PublishingService = {
  async publishToMedium(article, token) {
    try {
      const user = await MediumPublisher.getUser(token);
      if (user.errors) {
        throw new Error(user.errors[0].message);
      }

      const formattedArticle = MediumPublisher.formatArticleForMedium(article);
      const result = await MediumPublisher.publishPost(token, user.data.id, formattedArticle);

      return {
        success: !result.errors,
        url: result.data?.url,
        error: result.errors?.[0]?.message,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async shareOnTwitter(article, credentials) {
    try {
      const tweet = TwitterPublisher.formatArticleTweet(article);
      const result = await TwitterPublisher.postTweet(credentials, tweet);

      return {
        success: result.success,
        tweet,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async postDailyUpdate(stats, credentials) {
    try {
      const tweet = TwitterPublisher.formatDailyUpdate(stats);
      const result = await TwitterPublisher.postTweet(credentials, tweet);

      return {
        success: result.success,
        tweet,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// CLI helper for local publishing
export const publishArticle = async (slug) => {
  console.log(`
╭─────────────────────────────────────────╮
│  Article Publisher                       │
├─────────────────────────────────────────┤
│                                          │
│  To publish "${slug}" to Medium:         │
│                                          │
│  1. Get your Medium token from:          │
│     https://medium.com/me/settings       │
│                                          │
│  2. Run:                                 │
│     node scripts/publish-to-medium.js   │
│     --slug ${slug}                       │
│     --token YOUR_TOKEN                   │
│                                          │
╰─────────────────────────────────────────╯
  `);
};

export default PublishingService;
