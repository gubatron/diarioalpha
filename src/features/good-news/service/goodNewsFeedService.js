import { BaseFeedService } from '@core/services/base/baseFeedService.js'
import { FEED_CONFIG } from '@core/services/base/feedConfig.js'

/**
 * Service for fetching good news
 */
export class GoodNewsFeedService extends BaseFeedService {
  static async fetchGoodNews(maxItems = 12) {
    return await this.fetchFeeds(FEED_CONFIG.goodNews, { maxItems })
  }
}
