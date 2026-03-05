import { BaseFeedService } from '@core/services/base/baseFeedService.js'
import { FEED_CONFIG } from '@core/services/base/feedConfig.js'

/**
 * Service for fetching general news feeds
 */
export class NewsFeedService extends BaseFeedService {
  static async fetchNews(feedType, maxItems = 50) {
    const feeds = FEED_CONFIG.news[feedType]
    if (!feeds) {
      throw new Error(`Unknown feed type: ${feedType}`)
    }
    
    return await this.fetchFeeds(feeds, { maxItems })
  }
}
