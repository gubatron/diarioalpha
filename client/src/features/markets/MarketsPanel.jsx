import { useEffect, useState } from 'react'
import { useI18n } from '@context/I18nContext'
import { formatNumber, formatPercent } from '@utils'

const MARKETS = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'Nasdaq' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'IWM', name: 'Russell 2000' },
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' }
]

const MarketsPanel = () => {
  const [markets, setMarkets] = useState({})
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    fetchMarkets()
    const interval = setInterval(fetchMarkets, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMarkets = async () => {
    try {
      const data = {}
      for (const market of MARKETS) {
        try {
          const response = await fetch(
            `/api/yahoo/v8/finance/chart/${market.symbol}?interval=1d&range=1d`
          )
          const json = await response.json()
          const meta = json.chart?.result?.[0]?.meta

          if (meta) {
            const price = meta.regularMarketPrice
            const prevClose = meta.chartPreviousClose
            data[market.symbol] = {
              price,
              change: price - prevClose,
              changePercent: ((price - prevClose) / prevClose) * 100
            }
          }
        } catch (e) {
          console.error(`Failed to fetch ${market.symbol}`)
        }
      }
      setMarkets(data)
      setLoading(false)
    } catch (e) {
      console.error('Markets fetch error:', e)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('marketsPanel.loading')}</div>
  }

  return (
    <div className="flex flex-col gap-2">
      {MARKETS.map(market => {
        const data = markets[market.symbol]
        if (!data) return null

        const isUp = data.change >= 0

        return (
          <div key={market.symbol} className="p-3 bg-bg-dark flex justify-between items-center border border-transparent transition-all duration-200 hover:border-accent">
            <div>
              <div className="text-sm text-text-primary font-semibold">{market.name}</div>
              <div className="text-xs text-text-secondary">{market.symbol}</div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-text-primary">${formatNumber(data.price)}</div>
              <div className={`text-sm font-semibold ${isUp ? 'text-white' : 'text-[var(--alert)]'}`}>
                {formatPercent(data.changePercent)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MarketsPanel
