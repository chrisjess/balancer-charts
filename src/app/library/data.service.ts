import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Token, Pool, ChartBar } from '@app/library/models'
import { environment } from '../../environments/environment';

@Injectable()
export class DataService {

    private _balancerAssetTokens$: BehaviorSubject<Token[]> = new BehaviorSubject<Token[]>([]);
    private _balancerPoolList$: BehaviorSubject<Pool[]> = new BehaviorSubject<Pool[]>([]);
    private _recentTokenPairs$: BehaviorSubject<any> = new BehaviorSubject<any>([]);

    // General storage
    public tokensDataStore: Token[] = [];
    public poolsDataStore: Pool[] = [];
    public recentTokenPairsDataStore: string[][] = [];

    // Observable lists for use externally
    readonly balancerAssetTokens$ = this._balancerAssetTokens$.asObservable();
    readonly balancerPools$ = this._balancerPoolList$.asObservable();
    readonly recentTokenPairs$ = this._recentTokenPairs$.asObservable();

    constructor(private http: HttpClient) {

    }

    /**
     * Populate required data for application
     *  BalancerPools
     *  BalancerVettedTokens, CoinGecko, then combine
     * 
     *  Called from APP_INITIALIZER
     */
    public initialPopulate() {
        // Populate major data on first load
        this.populatePoolsList();
        this.populateTokens();
        this.populateRecentTokenPairs();
    }

    /**
     * Load vetted tokens & update data in that list with CoinGecko information
     */
    private populateTokens() {

        forkJoin([this.getBalancerVettedTokenlist(), this.getCoinGeckoCoinList()])
            .subscribe(([balancerVetted, coinGecko]: [Token[], Token[]]) => {
                let vettedTokens: Token[] = this.combineCoinGeckoDataIntoVetted(balancerVetted, coinGecko);
                this.tokensDataStore = vettedTokens;
                this._balancerAssetTokens$.next(this.tokensDataStore);
            });

    }

    /**
     * Populate behaviour subjects to be utilized by components
     */
    private populatePoolsList() {
        this.getBalancerPoollist().subscribe(items => {
            this.poolsDataStore = items;
            this._balancerPoolList$.next(this.poolsDataStore);
        });
    }

    /**
     * CoinGecko data contains spcific name and Id required for retrieving prive charts
     * 
     * Once loaded this will merge.
     */
    private combineCoinGeckoDataIntoVetted(vettedTokens: Token[], coinGeckoTokens: Token[]): Token[] {

        // If either are not set, return.
        if (!vettedTokens || !coinGeckoTokens) {
            return;
        }

        // If either are not set, return.
        if (vettedTokens.length == 0 || coinGeckoTokens.length == 0) {
            return;
        }

        vettedTokens.map(token => {

            let foundToken = coinGeckoTokens.find(({ symbol }) => token.symbol.toLowerCase() === symbol.toLowerCase());

            if (foundToken) {
                token.id = foundToken.id;
                token.name = foundToken.name;
            } else {
                // Some tokens in Pooks are not in the Vetted list
                token.id = '0x';
                token.name = 'not-found';
            }
        })

        return vettedTokens;

    }

    /**
     * Gets hourly data from CoinGecko
     * inputs
     * returns
     */
    public getRecentCoinGeckoHourlyMarketChart(firstCoin: string, secondCoin?: string, days: number = environment.coinGeckoHourlyMarketChartDays, against: string = environment.comparisonCurrency): Observable<ChartBar[]> {

        // To get hourly data from CoinGecko duration must be between 1 and 90 days.
        if (days < 1) days = 1;
        if (days > 90) days = 90;

        const timeStampEnd: number = Math.round((new Date()).getTime() / 1000);
        const daysInSeconds: number = days * 24 * 60 * 60;
        const timeStampStart: number = timeStampEnd - daysInSeconds;

        const firstURL: string = `${environment.urls.coinGeckoBase}/coins/${firstCoin}/market_chart/range?vs_currency=usd&from=${timeStampStart}&to=${timeStampEnd}`;
        if (!secondCoin) {
            return this.http.get<any>(firstURL)
                .pipe(
                    map(res => res['prices']
                        .map((el: [number, number], index: number) => {

                            let time: number = el[0]
                            let value: number = el[1];
                            let volume: number = res[0];

                            return new ChartBar({
                                time: time,
                                open: value,
                                volume: volume
                            })

                        })
                    )

                )
        } else {
            const secondURL: string = `${environment.urls.coinGeckoBase}/coins/${secondCoin}/market_chart/range?vs_currency=usd&from=${timeStampStart}&to=${timeStampEnd}`;
            return forkJoin([this.http.get(firstURL), this.http.get(secondURL)])
                .pipe(
                    map(res => res[0]['prices']
                        .map((el: [number, number], index: number) => {

                            let time: number = el[0];

                            // If the second URL has less values
                            // Sometimes Goingecko will return the results with several fewer entries for a coin.
                            if (index >= res[1]['prices'].length || index >= res[1]['total_volumes'].length) {
                                index = res[1]['prices'].length - 1; //Return the most recent that we have instead.
                            }

                            let value: number = el[1] / res[1]['prices'][index][1];
                            let volume = res[0]['total_volumes'][index][1] / res[1]['total_volumes'][index][1];

                            return new ChartBar({
                                time: time,
                                open: value,
                                volume: volume
                            })


                        })
                    )

                )
        }

    }

    /**
     * Gets all tokens from CoinGecko
     */
    public getCoinGeckoCoinList(): Observable<Token[]> {
        return this.http
            .get<any>(`${environment.urls.coinGeckoBase}/coins/list?include_platform=true`)
            .pipe(
                map(x => {

                    let tmpArray: Token[] = [];

                    x.forEach(element => {
                        tmpArray.push(new Token(element))
                    });

                    return tmpArray;
                }

                )
            )

    }

    /**
     * Gets the Vetted, Whitelist of tokens from Balancer
     * 
     * Only tokens from the main homestead ETH chain are loaded
     */
    public getBalancerVettedTokenlist(): Observable<Token[]> {
        return this.http
            .get<any>(environment.urls.balancerVettedTokens)
            .pipe(
                map(res => res['tokens']
                    .flatMap(item => item.chainId == 1 ? [new Token(item)] : []) // Only homestead
                )
            );

    }

    /**
    * Gets the Vetted, Whitelist of tokens from Balancer
    */
    public getBalancerPoollist(): Observable<Pool[]> {

        return this.http
            .get<any>(environment.urls.balancerPools)
            .pipe(
                map(res => res['pools']
                    .map(item =>
                        new Pool(item)
                    )
                )
            );

    }

    /**
     * Retrieve single Pool from Id
     */
    public getPool(poolId: string): Pool {
        if (!poolId) {
            return undefined;
        }

        let lowerCasePoolId: string = poolId.toLowerCase();

        let pools: Pool[] = this._balancerPoolList$.getValue();
        let found = pools.find(({ id }) => lowerCasePoolId === id.toLowerCase());
        return found;
    }


    /**
     * Retrieve single Token from address
     */
    public getBalancerVettedToken(address: string): Token {

        if (!address) return undefined;

        let lowerCaseAddress: string = address.toLowerCase();
        let foundToken = this.tokensDataStore.find(({ address }) => lowerCaseAddress === address.toLowerCase());

        if (foundToken && foundToken.id) {
            return foundToken;
        }

        return undefined;
    }

    /**
     * Retrieve single Token from symbol
     */
    public getBalancerVettedTokenBySymbol(symbol: string): Token {

        if (!symbol) return undefined;

        let lowerCaseSymbol: string = symbol.toLowerCase();

        let vettedTokens: Token[] = this.tokensDataStore;
        let foundToken = vettedTokens.find(({ symbol }) => lowerCaseSymbol === symbol.toLowerCase());

        if (foundToken && foundToken.id) {
            return foundToken;
        }

        return undefined;
    }

    /**
     * Populate recent searched pairs from LocalStorage
     */
    public populateRecentTokenPairs() {
        this.recentTokenPairsDataStore = [];
        const localStorageItem = localStorage.getItem("recentTokenPairs");

        if (localStorageItem) {
            this.recentTokenPairsDataStore = JSON.parse(localStorageItem);
            if (this.recentTokenPairsDataStore.length > 5) {
                this.recentTokenPairsDataStore = this.recentTokenPairsDataStore.slice(0, 5);
            }
        }

        this._recentTokenPairs$.next(this.recentTokenPairsDataStore);
    }

    /**
     * Add recent searched token pair and store in LocalStorage
     */
    public addRecentTokenPair(firstToken: string, secondToken: string) {

        if (this.recentTokenPairsDataStore.length >= 5) {
            this.recentTokenPairsDataStore = this.recentTokenPairsDataStore.slice(0, 4);
        }

        this.recentTokenPairsDataStore.push([firstToken, secondToken]);
        this._recentTokenPairs$.next(this.recentTokenPairsDataStore);
        localStorage.setItem("recentTokenPairs", JSON.stringify(this.recentTokenPairsDataStore));
    }

}