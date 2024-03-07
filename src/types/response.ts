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
  expirations: string[];
  total_values: string[];
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
}

export interface PyraZoneTierkeyActivityRes {}

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
  total_value: string;
}

export interface PyraMarketShareHolderRes {
  chain_id: number;
  publisher: string;
  share: string;
  shareholder: string;
  total_amount: string;
  staked_amount: string;
}

export interface PyraMarketShareActivityRes {
  chain_id: number;
  block_number: number;
  tx_hash: string;
  share: string;
  shareholder: string;
  buy_at?: string;
  buy_amount?: string;
  buy_price?: string;
  sell_at?: string;
  sell_amount?: string;
  sell_price?: string;
}
