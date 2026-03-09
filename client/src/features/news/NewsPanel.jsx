import { useEffect, useState, useContext } from 'react'
import { BaseFeedService } from './baseFeedService'
import { RefreshContext } from '@context/RefreshContext'
import { useI18n } from '@context/I18nContext'
import { getTimeAgo } from '@utils/dateHelpers'

const NewsPanel = ({ feeds, panelId }) => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { refreshKey } = useContext(RefreshContext)
  const { t, locale } = useI18n()

  useEffect(() => {
    let cancelled = false

    const fetchNews = async () => {
      try {
        setLoading(true)
        const items = await BaseFeedService.fetchFeeds(feeds, { maxItems: 50 })
        if (!cancelled) {
          setNews(items)
          setError(null)
        }
      } catch (e) {
        console.error('News fetch error:', e)
        if (!cancelled) {
          setError(t('news.failed', { message: e.message }))
          setNews([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // `feeds` is intentionally the only stable dep; `fetchNews` is defined inline
    // and would cause an infinite loop if included. `refreshKey` forces a new cycle
    // when the user clicks the REFRESH button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feeds, refreshKey])

  // Get unique sources count
  const uniqueSources = [...new Set(news.map(item => item.source))].length

  // Get theme class based on panel type
  const getThemeClass = () => {
    if (panelId === 'politics' || panelId === 'warwatch') return 'theme-blue'
    if (panelId === 'tech') return 'theme-cyan'
    if (panelId === 'finance') return 'theme-green'
    return 'theme-neutral'
  }

  if (loading && news.length === 0) {
    return <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('news.loading')}</div>
  }

  if (error && news.length === 0) {
    return <div className="p-8 text-center text-status-red text-[0.7rem]">{error}</div>
  }

  return (
    <div className={`${getThemeClass()} flex flex-col`}>
      <div className="news-summary flex gap-5 py-2.5 px-4 border-b border-[rgba(255,255,255,0.06)] items-center">
        <div className="flex items-center gap-1.5">
          <span className="stat-value text-[0.9rem] font-bold text-text-primary font-[family-name:var(--font-mono)]">{news.length}</span>
          <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.1em]">{t('news.articles')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="stat-value text-[0.9rem] font-bold text-text-primary font-[family-name:var(--font-mono)]">{uniqueSources}</span>
          <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.1em]">{t('news.sources')}</span>
        </div>
        <div className="flex items-center ml-auto gap-1">
          <span className="w-[5px] h-[5px] rounded-full bg-[#10b981] animate-live-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
          <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.1em]">{t('common.live')}</span>
        </div>
      </div>

      <div className="flex flex-col">
        {news.map((item, idx) => (
          <div key={idx} className="news-item py-2.5 px-4 bg-transparent border-l-2 border-l-transparent border-b border-b-[rgba(255,255,255,0.04)] transition-all duration-200 cursor-pointer relative last:border-b-0 hover:bg-[rgba(255,255,255,0.04)] hover:border-l-current hover:translate-x-0.5">
            <div className="item-source text-[0.7rem] font-semibold uppercase tracking-[0.08em] mb-0.5">{item.source}</div>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="block text-text-primary text-[0.85rem] leading-[1.45] no-underline font-normal transition-colors duration-200 hover:text-[#818cf8]">
              {item.title}
            </a>
            <div className="text-[0.7rem] text-text-dim mt-1 font-[family-name:var(--font-mono)]">{getTimeAgo(item.date, locale)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewsPanel
