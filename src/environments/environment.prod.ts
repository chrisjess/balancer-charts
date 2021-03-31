export const environment = {
  production: true,
  urls: {
    coinGeckoBase: "https://api.coingecko.com/api/v3",
    balancerVettedTokens: "https://raw.githubusercontent.com/balancer-labs/assets/50548de192fae33d5b91262dbba8a6ad378268f8/generated/vetted.tokenlist.json",
    balancerPools: "https://ipfs.fleek.co/ipns/balancer-team-bucket.storage.fleek.co/balancer-exchange/pools",
  },
  coinGeckoHourlyMarketChartDays: 28, // Between 1 and 90 to get hourly data from CoinGecko
  comparisonCurrency: 'usd', // Base to compare against
};
