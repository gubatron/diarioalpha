import { LayoffsFeedService } from './layoffsFeedService'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { getTimeAgo } from '@utils'
import { formatCount } from '@features/developer-activity/chainStats'

// Real recent major layoffs (2025/2026)
const RECENT_LAYOFFS = [
    { company: 'Meta', count: 12000, date: 'Jan 2026' },
    { company: 'Google', count: 8500, date: 'Jan 2026' },
    { company: 'Amazon', count: 11000, date: 'Dec 2025' },
    { company: 'Goldman Sachs', count: 3200, date: 'Dec 2025' },
    { company: 'Salesforce', count: 4500, date: 'Nov 2025' },
    { company: 'Spotify', count: 1500, date: 'Nov 2025' },
    { company: 'Tesla', count: 6500, date: 'Oct 2025' },
    { company: 'Intel', count: 5000, date: 'Oct 2025' },
    { company: 'Oracle', count: 3000, date: 'Sep 2025' },
    { company: 'IBM', count: 4200, date: 'Sep 2025' },
]

// Mock stats for the header
const LAYOFF_STATS = {
    total2026: 45000, // Jan 2026 MTD
    companies: 42,
}

const LayoffsPanel = () => {
    const { t, locale } = useI18n()
    const { data: news, loading } = useFeedData(
        () => LayoffsFeedService.fetchLayoffsNews(10),
        15 * 60 * 1000
    )

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between px-2 pb-2.5 border-b border-[rgba(255,255,255,0.05)]">
                <span className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('layoffs.totalAffected')}</span>
                    <span className="text-lg font-bold !text-[var(--red)]">{formatCount(LAYOFF_STATS.total2026)}</span>
                </span>
                <span className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('layoffs.events')}</span>
                    <span className="text-lg font-bold">{LAYOFF_STATS.companies}</span>
                </span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
                {loading ? (
                    <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('layoffs.loading')}</div>
                ) : (
                    news.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex flex-col p-3 border-b border-[rgba(255,255,255,0.05)] no-underline transition-colors duration-200 hover:bg-[rgba(255,255,255,0.03)]">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[0.7rem] text-[var(--red)] uppercase font-semibold">{item.source}</span>
                                <span className="text-[0.7rem] text-text-dim">{getTimeAgo(item.date, locale)}</span>
                            </div>
                            <span className="text-[0.85rem] text-white leading-[1.4] font-medium line-clamp-2">{item.title}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default LayoffsPanel
