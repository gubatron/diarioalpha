import { useEffect, useRef } from 'react'
import { useTheme } from '@context/ThemeContext'
import { useI18n } from '@context/I18nContext'

const SettingsModal = ({ isOpen, onClose }) => {
  const { currentTheme, setCurrentTheme, themes } = useTheme()
  const { language, languages, setLanguage, t } = useI18n()
  const closeButtonRef = useRef(null)

  // Focus trap and escape key handling
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-overlay-bg flex items-center justify-center z-[1000]" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="bg-bg-panel border border-border-main rounded-xl w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_0_1px_var(--glass-border)]" onClick={(e) => e.stopPropagation()}>
        <div className="py-5 px-6 border-b border-border-glass flex justify-between items-center">
          <h2 id="settings-modal-title" className="text-base font-semibold text-text-primary font-[family-name:var(--font-display)] tracking-[0.03em]">{t('settings.title')}</h2>
          <button 
            ref={closeButtonRef}
            className="bg-transparent border-none text-text-secondary text-xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-panel-item-hover hover:text-text-primary" 
            onClick={onClose}
            aria-label={t('settings.close')}
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <div>
            <h3 id="appearance-section" className="text-[0.7rem] font-semibold uppercase text-text-secondary tracking-[0.08em] mb-4 pb-2 border-b border-border-glass">{t('settings.appearance')}</h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3" role="radiogroup" aria-labelledby="appearance-section">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`flex flex-col items-center py-5 px-4 border-2 border-transparent rounded-[10px] cursor-pointer transition-all duration-200 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${currentTheme === key ? '!shadow-[0_0_0_2px_var(--accent)]' : ''}`}
                  onClick={() => setCurrentTheme(key)}
                  role="radio"
                  aria-checked={currentTheme === key}
                  aria-label={t('settings.selectTheme', { theme: t(`theme.${key}`) })}
                  style={{
                    backgroundColor: theme.colors['--bg-dark'],
                    borderColor: theme.colors['--border-color']
                  }}
                >
                  <div className="flex gap-1.5 mb-3.5" aria-hidden="true">
                    <div className="w-6 h-6 rounded-full border border-border-glass" style={{ background: theme.colors['--bg-panel'] }}></div>
                    <div className="w-6 h-6 rounded-full border border-border-glass" style={{ background: theme.colors['--accent'] }}></div>
                    <div className="w-6 h-6 rounded-full border border-border-glass" style={{ background: theme.colors['--text-primary'] }}></div>
                  </div>
                  <span className="text-[0.85rem] font-semibold font-[family-name:var(--font-display)]" style={{ color: theme.colors['--text-primary'] }}>
                    {t(`theme.${key}`)}
                  </span>
                  {currentTheme === key && (
                    <div className="absolute top-2 right-2 text-base font-bold" style={{ color: theme.colors['--accent'] }} aria-hidden="true">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 id="language-section" className="text-[0.7rem] font-semibold uppercase text-text-secondary tracking-[0.08em] mb-4 pb-2 border-b border-border-glass">{t('settings.language')}</h3>
            <p className="text-[0.75rem] text-text-dim mb-3">{t('settings.languageHelp')}</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3" role="radiogroup" aria-labelledby="language-section">
              {languages.map((option) => (
                <button
                  key={option.code}
                  className={`flex flex-col items-center py-5 px-4 border-2 border-transparent rounded-[10px] cursor-pointer transition-all duration-200 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${language === option.code ? '!shadow-[0_0_0_2px_var(--accent)]' : ''}`}
                  onClick={() => setLanguage(option.code)}
                  role="radio"
                  aria-checked={language === option.code}
                  aria-label={option.nativeLabel}
                >
                  <span className="text-[0.85rem] font-semibold font-[family-name:var(--font-display)]">
                    {option.nativeLabel}
                  </span>
                  {language === option.code && (
                    <div className="absolute top-2 right-2 text-base font-bold" aria-hidden="true">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
