export interface WatchlistRes {
  publisher: string;
  watcher: string;
  watch_at: string;
  watched: boolean;
}

export interface UserInfo {
  description: string;
  id: string;
  name: string;
  profile_image_url: string;
  username: string;
}

export interface PublisherProfileRes {
  publisher: string;
  cover_image_url: string;
  create_at: string;
  update_at: string;
  user_info?: UserInfo;
}

export interface PyraZoneRes {
  chain_id: number;
  block_number: number;
  tx_hash: string;
  asset_id: string;
  publisher: string;
  publication_id: number;
  publish_at: string;
  actions: string[];
  action_init_datas: string[];
  tierkeys: string[];
  tierkey_sales: number;
  expirations: string[];
  total_supplies: string[];
  tierkey_prices: string[];
  files_count: number;
  publisher_profile?: PublisherProfileRes;
}

export interface PyraZoneTierkeyHolderRes {
  chain_id: number;
  asset_id: string;
  tier: number;
  tierkey: string;
  tierkey_holder: string;
  key_id: string;
  expired_at: string;
  is_burned: boolean;
  user_info?: UserInfo;
}

export interface PyraZoneTierkeyHolderPortfolioRes {
  portfolios: {
    chain_id: number;
    asset_id: string;
    tierkeys_count: number;
    tierkeys_price: string;
    update_at: number; 
    publisher_profile?: PublisherProfileRes;
    user_info?: UserInfo;
  }[],
  total_tierkeys_price: string;
}

export interface PyraZoneTierkeyActivityRes {
  chain_id: number;
  block_number: number;
  tx_hash: string;
  asset_id: string;
  tier: number;
  tierkey: string;
  tierkey_holder: string;
  key_id: string;
  type: "Buy" | "Sell" | "Liquidate";
  buy_at?: string;
  buy_price?: string;
  sell_at?: string;
  sell_price?: string;
  liquidate_at?: string;
  liquidate_price?: string;
  liquidator?: string;
  user_info?: UserInfo;
}

export interface PyraMarketRes {
  chain_id: number;
  block_number: number;
  tx_hash: string;
  publisher: string;
  share: string;
  share_name: string;
  share_symbol: string;
  revenue_pool: string;
  fee_point: number;
  share_sales: number;
  total_supply: string;
  total_value: string;
  total_volume: string;
  total_asset_files?: number;
  publisher_profile?: PublisherProfileRes;
  publisher_daily_records: PublisherDailyRecordRes[];
}

export interface PyraMarketShareHolderRes {
  chain_id: number;
  publisher: string;
  share: string;
  shareholder: string;
  total_amount: string;
  staked_amount: string;
  user_info?: UserInfo;
}

export interface PyraMarketShareHolderPortfolioRes {
  portfolios: {
    chain_id: number;
    publisher: string;
    shares_amount: string;
    shares_price: string;
    update_at: number;
    publisher_profile?: PublisherProfileRes;
    user_info?: UserInfo;
  }[],
  total_shares_price: string
}

export interface PyraMarketShareActivityRes {
  chain_id: number;
  block_number: number;
  tx_hash: string;
  share: string;
  shareholder: string;
  type: "Buy" | "Sell";
  buy_at?: string;
  buy_amount?: string;
  buy_price?: string;
  sell_at?: string;
  sell_amount?: string;
  sell_price?: string;
  user_info?: UserInfo;
}

export interface RevenuePoolActivityRes {
  chain_id: number;
  block_number: number;
  tx_hash: string;
  revenue_pool: string;
  shareholder: string;
  type: "Stake" | "Unstake" | "Claim";
  stake_at?: string;
  stake_amount?: string;
  unstake_at?: string;
  unstake_amount?: string;
  claim_at?: string;
  claim_amount?: string;
  user_info?: UserInfo;
}

export interface PublisherDailyRecordRes {
  chain_id: number;
  publisher: string;
  share_volume: string;
  date: string;
}
