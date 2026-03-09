import { createFeedFetcher } from '@features/news/createFeedFetcher'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { getTimeAgo } from '@utils/dateHelpers'

// Active conflict zones
const CONFLICT_ZONES = [
    { region: 'Ukraine', status: 'active', intensity: 'high' },
    { region: 'Gaza', status: 'active', intensity: 'high' },
    { region: 'Red Sea', status: 'active', intensity: 'medium' },
    { region: 'Myanmar', status: 'active', intensity: 'medium' },
    { region: 'Sudan', status: 'active', intensity: 'high' },
    { region: 'Syria', status: 'ongoing', intensity: 'low' },
]

const fetchWarNews = createFeedFetcher('warWatch', 15)

const WarWatchPanel = () => {
    const { data: news, loading } = useFeedData(fetchWarNews, 5 * 60 * 1000)
    const { t, locale } = useI18n()

    if (loading && news.length === 0) {
        return <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('warwatch.loading')}</div>
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-wrap gap-1.5 py-2.5 px-4 bg-[rgba(239,68,68,0.05)] border-b border-[rgba(239,68,68,0.1)]">
                {CONFLICT_ZONES.map((zone, idx) => (
                    <div key={idx} className={`intensity-${zone.intensity} flex items-center gap-1 py-0.5 px-2 bg-[rgba(0,0,0,0.3)] rounded-[3px] border border-[rgba(255,255,255,0.05)]`}>
                        <span className="zone-indicator w-[5px] h-[5px] rounded-full"></span>
                        <span className="text-[0.6rem] text-text-primary font-semibold">{zone.region}</span>
                        <span className="text-[0.45rem] text-text-dim uppercase">{t(`intensity.${zone.intensity}`)}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col">
                {news.map((item, idx) => (
                    <div key={idx} className="py-2.5 px-4 border-b border-[rgba(255,255,255,0.04)] transition-all duration-200 hover:bg-[rgba(239,68,68,0.03)] last:border-b-0">
                        <div className="text-[0.7rem] text-[#f87171] font-semibold uppercase tracking-[0.08em] mb-[0.15rem]">{item.source}</div>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block text-[0.85rem] text-text-primary no-underline leading-[1.4] transition-colors duration-200 hover:text-[#f87171]">
                            {item.title}
                        </a>
                        <div className="text-[0.7rem] text-text-dim mt-0.5 font-[family-name:var(--font-mono)]">{getTimeAgo(item.date, locale)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WarWatchPanel
