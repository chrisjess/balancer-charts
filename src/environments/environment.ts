// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  urls: {
    coinGeckoBase: "https://api.coingecko.com/api/v3",
    balancerVettedTokens: "https://raw.githubusercontent.com/balancer-labs/assets/50548de192fae33d5b91262dbba8a6ad378268f8/generated/vetted.tokenlist.json",
    balancerPools: "https://ipfs.fleek.co/ipns/balancer-team-bucket.storage.fleek.co/balancer-exchange/pools",
  },
  coinGeckoHourlyMarketChartDays: 28, // Between 1 and 90 to get hourly data from CoinGecko
  comparisonCurrency: 'usd', // Base to compare against
};