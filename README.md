# Balancer Charts

Balancer [https://balancer.finance/] is an Automated Market Maker(AMM) protocol. Pools of vetted asset tokens allow anyone to perform swaps.

Users would benefit from easy access to general prices & volumes charts for tokens on Balancer.

This project is a simple frontend site to offer this functionality.

Built in Angular with TypeScript, using Trading View charts, loading data from several APIs.

Entry to https://gitcoin.co/issue/balancer-labs/balancer-bounties/8/100024942

Demo site https://chrisjess.github.io/balancer-charts-demo/


# Major facets

* Gather all trading pairs in pools from public Balancer data
* Gather historical price volume data from CoinGecko API
* Integrate industry standard Trading View [https://uk.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/?feature=technical-analysis-charts] charts
* Offer great UX for users to load & filter tokens & pools

At the core, this project is about making balancer easier to use and presenting better data to those who would benefit from it. Rather that simply stopping at integrating Trading View for Token Pairs a more holistic investigation.


# User guide

https://chrisjess.github.io/balancer-charts-demo/user-guide


# API URLS used

## Coin Gecko

Token prices & volumes
[https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=1392577232&to=1422577232]

Token information
[https://api.coingecko.com/api/v3/coins/list?include_platform=true]
                                

## The Graph
Balancer Pools Information
[https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-beta]
                         

## Balancer Github
Balancer Vetted Token list
[https://raw.githubusercontent.com/balancer-labs/assets/50548de192fae33d5b91262dbba8a6ad378268f8/generated/vetted.tokenlist.json]

## Fleek.co
Current Balancer Pools
[https://storageapi.fleek.co/balancer-bucket/balancer-exchange/pools]


# Major Frameworks & Components

- Angular 11.x
- RxJS
- Bootstrap
- Fontawesome


# Potential Roadmap/Next Steps
- Feedback from real Balancer users (features they would like, their workflows, levels that interfaces should be geared for)
- Testing, manual and automated
- Fallbacks, retries and user feedback when data elements fial to load
- Investigate what data is important and what would be important to users (gas fees, more pool information)
- Integration of more data to enrich interfaces, aid decision making, allow detailed filtering (e.g. based on Token purpose)
- Custom backend to serve full CHLOSTV data
- Ability for users to save favourite tokens & searches
- Actions directly from charts (market orders/limit orders), triggers for actions to occur (trade X when price goes to Y)