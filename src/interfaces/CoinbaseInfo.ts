type Market = {
    base: string
    target: string
    market: {
        name: string
        identifier: string
        has_trading_incentive: boolean
    },
    last: number
    volume: number
    converted_last: Record<string, number>
    converted_volume: Record<string, number>
    trust_score: string
    bid_ask_spread_percentage: number
    timestamp: string
    last_traded_at: string
    last_fetch_at: string
    is_anomaly: boolean
    is_stale: boolean
    trade_url: string
    token_info_url: null,
    coin_id: string
    target_coin_id: string
}

export interface CoinbaseInfo {
    id: string
    symbol: string
    name: string
    web_slug: string
    asset_platform_id: string
    platforms: Record<string, string>
    detail_platforms: Record<string, Record<string, string>>
    block_time_in_minutes: number
    hashing_algorithm: null
    categories: string[]
    preview_listing: boolean
    public_notice: null
    additional_notices: unknown[]
    localization: Record<string, string>
    description: Record<string, string>
    links: {
        homepage: string[]
        whitepaper: string
        blockchain_site: string[]
        official_forum_url: string[]
        chat_url: string[]
        announcement_url: unknown[]
        twitter_screen_name: string,
        facebook_username: null,
        bitcointalk_thread_identifier: null,
        telegram_channel_identifier: string,
        subreddit_url: null,
        repos_url: Record<string, string[]>
    }
    image: Record<string, string>
    country_origin: null
    genesis_date: null
    contract_address: string
    sentiment_votes_up_percentage: number
    sentiment_votes_down_percentage: number
    watchlist_portfolio_users: number
    market_cap_rank: number
    market_data: {
        current_price: Record<string, number>
        total_value_locked: null,
        mcap_to_tvl_ratio: null,
        fdv_to_tvl_ratio: null,
        roi: null,
        ath: Record<string, number>
        ath_change_percentage: Record<string, number>
        ath_date: Record<string, string>
        atl: Record<string, number>
        atl_change_percentage: Record<string, number>
        atl_date: Record<string, string>
        market_cap: Record<string, number>
        market_cap_rank: number
        fully_diluted_valuation: Record<string, number>
        market_cap_fdv_ratio: number
        total_volume: Record<string, number>
        high_24h: Record<string, number>
        low_24h: Record<string, number>
        price_change_24h: number
        price_change_percentage_24h: number
        price_change_percentage_7d: number
        price_change_percentage_14d: number
        price_change_percentage_30d: number
        price_change_percentage_60d: number
        price_change_percentage_200d: number
        price_change_percentage_1y: number
        market_cap_change_24h: number
        market_cap_change_percentage_24h: number
        price_change_24h_in_currency: Record<string, number>
        price_change_percentage_1h_in_currency: Record<string, number>
        price_change_percentage_24h_in_currency: Record<string, number>
        price_change_percentage_7d_in_currency: Record<string, number>
        price_change_percentage_14d_in_currency: Record<string, number>
        price_change_percentage_30d_in_currency: Record<string, unknown>,
        price_change_percentage_60d_in_currency: Record<string, unknown>,
        price_change_percentage_200d_in_currency: Record<string, unknown>,
        price_change_percentage_1y_in_currency: Record<string, unknown>,
        market_cap_change_24h_in_currency: Record<string, number>
        market_cap_change_percentage_24h_in_currency: Record<string, number>
        total_supply: number
        max_supply: number
        circulating_supply: number
        last_updated: string
    }
    community_data: Record<string, number>
    developer_data: {
        forks: number
        stars: number
        subscribers: number
        total_issues: number
        closed_issues: number
        pull_requests_merged: number
        pull_request_contributors: number
        code_additions_deletions_4_weeks: Record<string, number>
        commit_count_4_weeks: number
        last_4_weeks_commit_activity_series: number[]
    },
    status_updates: unknown[]
    last_updated: string
    tickers: Market[]
}