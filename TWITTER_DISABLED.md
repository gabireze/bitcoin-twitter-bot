# Twitter/X Support - Currently Disabled

This document explains why Twitter/X posting is currently disabled while BlueSky posting remains fully functional.

## Status

- **BlueSky**: Fully operational (all features working)
- **Twitter/X**: Temporarily disabled due to API restrictions

## Why Twitter/X is Disabled

Since Twitter's rebranding to X, the platform has implemented strict API access policies:

### API Access Restrictions
- **Elevated Account Tier Required**: Basic API access no longer supports posting functionality
- **Rate Limiting**: Significantly reduced rate limits (as low as 300 posts/month for basic tier)
- **Approval Process**: New app applications face lengthy review periods
- **Cost**: Paid tier required for reliable posting access ($100+/month)

### Twitter API v2 Limitations
- Requires manual approval from X/Twitter team
- Post requests frequently rejected with rate limit errors
- Inconsistent behavior and unexpected API changes
- Limited backwards compatibility

### Business Rationale
For a public cryptocurrency bot, the current X API limitations make it impractical:
- High costs with no guarantee of service reliability
- Complex approval processes with unclear requirements
- Frequent API changes breaking existing integrations
- Better alternatives available (BlueSky uses open protocols)

## Current Implementation

### Disabled Functions

The following functions in `src/services/twitterService.mjs` return mock/disabled responses:
- `postTweet()` - Returns disabled message
- `uploadMediaAndGetIds()` - Returns mock media IDs

The bot still:
- Generates all content correctly
- Creates screenshots
- Fetches price data
- Schedules all tasks

But posts only to BlueSky instead of both platforms.

### What Still Works

- BlueSky posting with images
- Price data fetching
- Screenshot generation (Coinglass)
- Fear & Greed Index updates
- Structured logging
- Task scheduling

## How to Re-Enable Twitter

To re-enable Twitter posting in the future:

1. **Update environment variables** (.env):
   ```
   TWITTER_API_KEY=your-key
   TWITTER_API_SECRET=your-secret
   TWITTER_ACCESS_TOKEN=your-token
   TWITTER_ACCESS_TOKEN_SECRET=your-secret
   ```

2. **Uncomment code** in `src/services/twitterService.mjs`:
   - Uncomment imports: `axios`, `fs`, `APIError`
   - Uncomment `postTweet()` function body
   - Uncomment `uploadMediaAndGetIds()` function body

3. **Uncomment imports** in `src/controllers/botController.mjs`:
   - Uncomment Twitter service imports
   - Uncomment Twitter posting calls in all methods

4. **Restart the bot**:
   ```bash
   npm start
   ```

## Logs

When Twitter is disabled, the logs will show:
```
Twitter posting is DISABLED - postTweet function commented out
Twitter media upload is DISABLED - uploadMediaAndGetIds function commented out
```

This makes it clear in monitoring logs that Twitter is not posting actual content.

## Getting X/Twitter API Access

If you want to enable Twitter/X posting in the future:

1. **Create a Developer Account**: Visit [developer.twitter.com](https://developer.twitter.com)
2. **Apply for Access**: Submit application explaining your use case
3. **Wait for Approval**: Expect 1-4 weeks review time
4. **Upgrade Tier**: Consider paid tier for reliable rate limits
5. **Get Credentials**: 
   - API Key (App Key)
   - API Secret
   - Access Token
   - Access Token Secret

## Future

Twitter/X support can be fully restored by following the re-enablement steps above once Twitter Developer API access is properly configured.