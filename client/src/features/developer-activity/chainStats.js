// https://beaconcha.in/api/v1/epoch/latest  →  data.validatorscount
const BEACON_EPOCH_LATEST = 'https://beaconcha.in/api/v1/epoch/latest'
const DEFI_LLAMA_CHAINS = 'https://api.llama.fi/v2/chains'
const KOIOS_POOL_LIST = 'https://api.koios.rest/api/v1/pool_list'
const AVAX_P_CHAIN = 'https://api.avax.network/ext/P'

const cache = new Map()
const TTL = 15 * 60 * 1000 // 15 minutes

const safeFetch = async (url, options = {}) => {
    const key = url + JSON.stringify(options.body ?? '')
    const hit = cache.get(key)
    if (hit && Date.now() - hit.ts < TTL) return hit.data
    const res = await fetch(url, { headers: { Accept: 'application/json' }, ...options })
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`)
    const data = await res.json()
    cache.set(key, { data, ts: Date.now() })
    return data
}

/* ==================== TVL (DefiLlama - unchanged) ==================== */
const fetchChainTVL = async (slug) => {
    try {
        const res = await fetch(`https://api.llama.fi/tvl/${slug}`)
        if (res.ok) {
            const tvl = parseFloat(await res.text())
            if (!isNaN(tvl)) return tvl
        }
    } catch {}
    const chains = await safeFetch(DEFI_LLAMA_CHAINS)
    const match = chains.find(c => c.name?.toLowerCase() === slug.toLowerCase())
    return match?.tvl ?? null
}

/* ==================== Node/Validator Counts (direct chain) ==================== */
const fetchAvaxValidators = async () => {
    console.debug('[validators] Fetching Avalanche validators from', AVAX_P_CHAIN)
    try {
        const data = await safeFetch(AVAX_P_CHAIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'platform.getCurrentValidators',
                params: {},
            }),
        })
        console.debug('[validators] Avalanche raw response:', data)
        const count = data?.result?.validators?.length ?? null
        console.debug('[validators] Avalanche validator count:', count)
        return count
    } catch (err) {
        console.error('[validators] Avalanche fetch failed:', err.message)
        throw err
    }
}

const fetchCardanoPools = async () => {
    console.debug('[validators] Fetching Cardano pools from', KOIOS_POOL_LIST)
    try {
        const data = await safeFetch(KOIOS_POOL_LIST)
        console.debug('[validators] Cardano raw response sample:', Array.isArray(data) ? data.slice(0, 2) : data)
        if (!Array.isArray(data)) {
            console.warn('[validators] Cardano: expected array, got:', typeof data)
            return null
        }
        const active = data.filter(p => p.pool_status === 'active')
        console.debug('[validators] Cardano active pools:', active.length, '/ total:', data.length)
        return active.length
    } catch (err) {
        console.error('[validators] Cardano fetch failed:', err.message)
        throw err
    }
}

const fetchEthereumValidators = async () => {
    console.debug('[validators] Fetching Ethereum validators from', BEACON_EPOCH_LATEST)
    try {
        const data = await safeFetch(BEACON_EPOCH_LATEST)
        console.debug('[validators] Ethereum raw response:', data)
        const count = data?.data?.validatorscount ?? null
        console.debug('[validators] Ethereum validator count:', count)
        if (count === null) {
            console.warn('[validators] Ethereum: validatorscount missing — response shape:', JSON.stringify(data).slice(0, 300))
        }
        return count
    } catch (err) {
        console.error('[validators] Ethereum fetch failed:', err.message)
        throw err
    }
}

/* ==================== Total Commits (REST Link-header trick - works without auth) ==================== */
const getGitHubHeaders = () => {
    const token = import.meta.env.VITE_GITHUB_TOKEN
    return token
        ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
        : { Accept: 'application/vnd.github+json' }
}

const fetchRepoTotalCommits = async (owner, name) => {
    const url = `https://api.github.com/repos/${owner}/${name}/commits?per_page=1`
    const res = await fetch(url, { headers: getGitHubHeaders() })
    if (!res.ok) {
        console.warn(`GitHub commits HTTP ${res.status} for ${owner}/${name}`)
        return 0
    }
    const link = res.headers.get('Link')
    if (!link) {
        // No pagination header means there is only 1 page (≤1 commit)
        const data = await res.json()
        return Array.isArray(data) ? data.length : 0
    }
    const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/)
    return match ? parseInt(match[1], 10) : 0
}

const fetchTotalCommits = async (repos) => {
    if (!Array.isArray(repos) || repos.length === 0) return null

    let total = 0
    for (const repoStr of repos) {
        const [owner, name] = repoStr.split('/')
        if (!owner || !name) continue
        try {
            total += await fetchRepoTotalCommits(owner, name)
        } catch (err) {
            console.warn(`GitHub commits failed for ${repoStr}:`, err.message)
        }
    }
    return total > 0 ? total : null
}

/* ==================== Chain Config ==================== */
export const CHAIN_CONFIG = {
    ethereum: {
        tvlSlug: 'ethereum',
        repos: [
            'ethereum/go-ethereum',      // Official execution client (flagship)
            'sigp/lighthouse',           // Leading consensus client (~50% of validators)
            'prysmaticlabs/prysm'        // Major consensus client
        ],
        validatorLabel: 'validators',
        validatorFetcher: fetchEthereumValidators
    },
    cardano: {
        tvlSlug: 'cardano',
        repos: [
            'IntersectMBO/cardano-node',   // Core node
            'IntersectMBO/cardano-ledger'  // Core ledger logic
        ],
        validatorLabel: 'stake pools',
        validatorFetcher: fetchCardanoPools
    },
    avalanche: {
        tvlSlug: 'avalanche',
        repos: [
            'ava-labs/avalanchego'       // Primary node implementation (only one needed)
        ],
        validatorLabel: 'validators',
        validatorFetcher: fetchAvaxValidators
    }
}

/* ==================== Main Export ==================== */
export const fetchChainStats = async () => {
    const results = {}

    for (const [key, config] of Object.entries(CHAIN_CONFIG)) {
        console.log(`Fetching chain stats for ${key}...`)
        
        const [tvlRes, validatorsRes, commitsRes] = await Promise.allSettled([
            fetchChainTVL(config.tvlSlug),
            config.validatorFetcher(),
            fetchTotalCommits(config.repos)
        ])

        console.log(`${key} TVL:`, tvlRes.status === 'fulfilled' ? tvlRes.value : 'failed')
        console.log(`${key} Validators:`, validatorsRes.status === 'fulfilled' ? validatorsRes.value : 'failed')
        console.log(`${key} Total Commits:`, commitsRes.status === 'fulfilled' ? commitsRes.value : 'failed')

        results[key] = {
            tvl: tvlRes.status === 'fulfilled' ? tvlRes.value : null,
            validators: validatorsRes.status === 'fulfilled' ? validatorsRes.value : null,
            totalCommits: commitsRes.status === 'fulfilled' ? commitsRes.value : null,
            validatorLabel: config.validatorLabel
        }
    }

    console.log('Fetched chain stats:', results)
    return results
}

/* ==================== Formatting (unchanged) ==================== */
export const formatTVL = (tvl) => {
    if (tvl === null || tvl === undefined) return null
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`
    return `$${tvl.toLocaleString()}`
}

export const formatCount = (n) => {
    if (n === null || n === undefined) return null
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
    return n.toLocaleString()
}
