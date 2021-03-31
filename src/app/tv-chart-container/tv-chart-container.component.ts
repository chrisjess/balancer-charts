import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from "@angular/common/http";

import { BehaviorSubject, combineLatest, forkJoin, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { Token, Pool, ChartBar } from "@app/library/models";

import { DataService } from "@app/library/data.service";

import {
  widget,
  IChartingLibraryWidget,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
  IBasicDataFeed,
  DatafeedConfiguration,
  LibrarySymbolInfo,
  Bar,
  ChartStyle,
  SeriesStyle,
  SearchSymbolResultItem,
} from '../../assets/charting_library/charting_library';
import { ErrorCallback, HistoryCallback } from '../../assets/charting_library/charting_library';
import { forEachChild } from 'typescript';
import { importExpr } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-tv-chart-container',
  templateUrl: './tv-chart-container.component.html',
  styleUrls: ['./tv-chart-container.component.css']
})
export class TvChartContainerComponent implements OnInit, OnDestroy {

  public symbolsType: 'pair' | 'pool' = 'pair';
  public poolId: string = "";
  public originTokenSymbol: string = 'WETH';
  public destinationTokenSymbol: string = 'USDC';
  private pool: Pool;
  private createdStudySymbols: string[] = [];

  private _symbol: ChartingLibraryWidgetOptions['symbol'] = 'WETH/USDC';
  private _theme: ChartingLibraryWidgetOptions['theme'] = 'Dark';
  private _interval: ChartingLibraryWidgetOptions['interval'] = 'D' as ResolutionString;
  private _datafeedUrl = '';
  private _libraryPath: ChartingLibraryWidgetOptions['library_path'] = './assets/charting_library/';
  private _chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'] = 'https://saveload.tradingview.com';
  private _chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'] = '1.1';
  private _clientId: ChartingLibraryWidgetOptions['client_id'] = 'tradingview.com';
  private _userId: ChartingLibraryWidgetOptions['user_id'] = 'public_user_id';
  private _fullscreen: ChartingLibraryWidgetOptions['fullscreen'] = false;
  private _autosize: ChartingLibraryWidgetOptions['autosize'] = true;
  private _containerId: ChartingLibraryWidgetOptions['container_id'] = 'tv_chart_container';
  private _tvWidget: IChartingLibraryWidget | null = null;

  @Input()
  set symbol(symbol: ChartingLibraryWidgetOptions['symbol']) {
    this._symbol = symbol || this._symbol;
  }

  get symbol() {
    return this._symbol;
  }

  @Input()
  set interval(interval: ChartingLibraryWidgetOptions['interval']) {
    this._interval = interval || this._interval;
  }

  @Input()
  set datafeedUrl(datafeedUrl: string) {
    this._datafeedUrl = datafeedUrl || this._datafeedUrl;
  }

  @Input()
  set libraryPath(libraryPath: ChartingLibraryWidgetOptions['library_path']) {
    this._libraryPath = libraryPath || this._libraryPath;
  }

  @Input()
  set chartsStorageUrl(chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url']) {
    this._chartsStorageUrl = chartsStorageUrl || this._chartsStorageUrl;
  }

  @Input()
  set chartsStorageApiVersion(chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version']) {
    this._chartsStorageApiVersion = chartsStorageApiVersion || this._chartsStorageApiVersion;
  }

  @Input()
  set clientId(clientId: ChartingLibraryWidgetOptions['client_id']) {
    this._clientId = clientId || this._clientId;
  }

  @Input()
  set userId(userId: ChartingLibraryWidgetOptions['user_id']) {
    this._userId = userId || this._userId;
  }

  @Input()
  set fullscreen(fullscreen: ChartingLibraryWidgetOptions['fullscreen']) {
    this._fullscreen = fullscreen || this._fullscreen;
  }

  @Input()
  set autosize(autosize: ChartingLibraryWidgetOptions['autosize']) {
    this._autosize = autosize || this._autosize;
  }

  @Input()
  set containerId(containerId: ChartingLibraryWidgetOptions['container_id']) {
    this._containerId = containerId || this._containerId;
  }

  constructor(private route: ActivatedRoute, public dataService: DataService) {

  }

  get dataFeed(): IBasicDataFeed {
    let bdf: IBasicDataFeed = {

      /* mandatory methods for realtime chart */
      onReady: cb => {

        let dfc: DatafeedConfiguration = {
          exchanges: [{ value: 'Balancer', name: 'Balancer', desc: 'Balancer Vetted Pool Tokens (price/volume data provided by CoinGecko)' }],
          supported_resolutions: ['1H' as ResolutionString],
          currency_codes: ["USD", "BTC", "ETH"],
          supports_marks: true,
          supports_time: true,
          supports_timescale_marks: true,
          symbols_types: [{ name: 'Balancer Pool Tokens', value: 'Balancer Pool Tokens' }]
        }

        // Return Async
        setTimeout(() => cb(dfc), 0);
      },
      // only need searchSymbols when search is enabled
      searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {

        // Split user input on non-numeric
        const userInputs: string[] = userInput.toLowerCase().split(/[^a-z]/, 2);

        let symbols: string[] = this.dataService.tokensDataStore.map(item => item.symbol);

        let filteredSymbolsFirst: string[] = [];
        let filteredSymbolsSecond: string[] = [];
        let combinedSymbols: SearchSymbolResultItem[] = [];

        filteredSymbolsFirst = symbols.filter(symbol => {
          return (symbol.toLowerCase().includes(userInputs[0]));
        });

        if (userInputs.length > 1) {
          filteredSymbolsSecond = symbols.filter(symbol => {
            return (symbol.toLowerCase().includes(userInputs[1]));
          });
        }

        if (filteredSymbolsSecond.length > 0) {
          combinedSymbols = this.joinSymbolsLists(filteredSymbolsFirst, filteredSymbolsSecond);
        } else {
          combinedSymbols = this.joinSymbolsLists(filteredSymbolsFirst, filteredSymbolsFirst);
        }

        // Return Async
        setTimeout(function () {
          onResultReadyCallback(combinedSymbols);
        }, 0)

      },
      resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {

        let symbol_stub: LibrarySymbolInfo = {

          full_name: symbolName,
          exchange: 'Balancer',
          listed_exchange: 'Balancer',
          format: 'price',

          name: symbolName,
          description: '',
          type: 'crypto',
          session: '24x7',
          timezone: 'America/New_York',
          ticker: symbolName,
          minmov: 1,
          pricescale: 100000000,
          has_intraday: true,
          intraday_multipliers: ['60'],
          supported_resolutions: ['1H' as ResolutionString],
          volume_precision: 8,
          data_status: 'endofday',
        }

        // Return Async
        setTimeout(function () {
          onSymbolResolvedCallback(symbol_stub);
        }, 0)
      },


      getBars: (symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, from: number, to: number, onHistoryCallback: HistoryCallback, onErrorCallback: ErrorCallback, firstDataRequest: boolean) => {

        if (this.symbolsType == 'pool' && this.pool && firstDataRequest && this.createdStudySymbols.length == 0) {
          // Pass the tokens to be added, not the first as this was already the main symbol
          this.createPoolStudies(this._tvWidget, this.pool.tokens.slice(1));
          return;
        }

        // If a pair split with a slash are entered split them.
        let splitSymbolName: string[] = symbolInfo.name.split('/');

        let originSymbol: string = '';
        let destinationSymbol: string = '';

        if (splitSymbolName.length == 0) {
          return;
        }

        if (splitSymbolName.length > 0) {
          originSymbol = splitSymbolName[0];
        }

        if (splitSymbolName.length > 1) {
          destinationSymbol = splitSymbolName[1];
        }

        let originTokenId: string = this.getTokenID(originSymbol);
        let destinationTokenId: string = this.getTokenID(destinationSymbol);

        if (!firstDataRequest) return;

        if (originTokenId && destinationTokenId) {
          this.loadDoubleSymbols(originTokenId, destinationTokenId, onHistoryCallback);
        } else if (originTokenId) {
          this.loadSingleSymbol(originTokenId, onHistoryCallback);
        }


      },

      subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
        //console.log('SB');
      },
      unsubscribeBars: subscriberUID => {
        //console.log('UB');
      },
    }
    return bdf;
  }

  //Get the CoinGecko ID from the standard symbol
  public getTokenID(tokenSymbol: string) {

    let returnValue: string = '';

    if (tokenSymbol) {
      let token: Token = this.dataService.getBalancerVettedTokenBySymbol(tokenSymbol);
      if (token && token.id) {
        returnValue = token.id;
      }
    }

    return returnValue;
  }

  ngOnInit() {

    //Get changes to route - pair data or pool
    const routeData = combineLatest([this.route.params, this.route.data]).pipe(
      map(([a$, b$]) => ({
        params: a$,
        data: b$,
      }))
    );

    routeData.subscribe(routeParams => {

      this.poolId = '';
      this.originTokenSymbol = '';
      this.destinationTokenSymbol = '';

      switch (routeParams.data['symbolsType']) {
        case 'pair': {
          this.symbolsType = 'pair';
          this.originTokenSymbol = routeParams.params['originTokenSymbol'];
          this.destinationTokenSymbol = routeParams.params['destinationTokenSymbol'];
          this.symbol = `${this.originTokenSymbol}/${this.destinationTokenSymbol}`;
          break;
        }
        case 'pool': {
          this.symbolsType = 'pool';
          this.poolId = routeParams.params['poolId'];
          this.symbol = this.poolId;
          break;
        }
        default: {
          this.symbolsType = 'pair';
          this.originTokenSymbol = 'WETH';
          this.destinationTokenSymbol = 'USDC';
          this.symbol = `${this.originTokenSymbol}/${this.destinationTokenSymbol}`;
          break;
        }
      }
    });


    function getLanguageFromURL(): LanguageCode | null {
      const regex = new RegExp('[\\?&]lang=([^&#]*)');
      const results = regex.exec(location.search);

      return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode;
    }

    combineLatest(
      [this.dataService.balancerAssetTokens$,
      this.dataService.balancerPools$]
    ).subscribe(([balancerAssetTokens, balancerPools]) => {

      if (!balancerAssetTokens || !balancerPools) return;

      if (balancerAssetTokens.length == 0 || balancerPools.length == 0) return;

      if (this.symbolsType == 'pool') {
        this.pool = this.dataService.getPool(this.poolId);
        let address: string = this.pool?.tokens[0]?.address;
        if (!address) return;
        let foundToken: Token = this.dataService.getBalancerVettedToken(address);
        if (!foundToken) return;
        this.symbol = foundToken.symbol;
      }

      const widgetOptions: ChartingLibraryWidgetOptions = {
        symbol: this._symbol,
        //datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(this._datafeedUrl),
        datafeed: this.dataFeed, // JS API
        interval: this._interval,
        container_id: this._containerId,
        library_path: this._libraryPath,
        locale: getLanguageFromURL() || 'en',
        disabled_features: ['use_localstorage_for_settings'],
        enabled_features: ['study_templates'],
        charts_storage_url: this._chartsStorageUrl,
        charts_storage_api_version: this._chartsStorageApiVersion,
        client_id: this._clientId,
        user_id: this._userId,
        fullscreen: this._fullscreen,
        autosize: this._autosize,
        theme: this._theme,
        timeframe: '14D',
      };

      const tvWidget = new widget(widgetOptions);
      this._tvWidget = tvWidget;

      tvWidget.onChartReady(() => {

        tvWidget.activeChart().setChartType(SeriesStyle.Line); //Show lines

        tvWidget.activeChart().onSymbolChanged().subscribe(null, () => {
          let symbols: string[] = tvWidget.chart().symbol().split('/');
          this.dataService.addRecentTokenPair(symbols[0], symbols[1]);
        });

        /*
        tvWidget.headerReady().then(() => {
          const button = tvWidget.createButton();
          button.setAttribute('title', 'Click to show a notification popup');
          button.classList.add('apply-common-tooltip');
          button.addEventListener('click', () => tvWidget.showNoticeDialog({
            title: 'Notification',
            body: 'TradingView Charting Library API works correctly',
            callback: () => {
              console.log('Noticed!');
            },
          }));
          button.innerHTML = 'Check API';
        });
        */

        tvWidget.chart().onIntervalChanged().subscribe(null, function (interval, obj) {
          //console.log(interval)
        })

      });
    });


  }

  public createPoolStudies(tvWidget: IChartingLibraryWidget, tokens: Token[]) {

    tokens.forEach(token => {

      let foundToken: Token = this.dataService.getBalancerVettedToken(token.address);

      if (foundToken && foundToken.symbol && !this.createdStudySymbols.includes(foundToken.symbol)) {
        this.createdStudySymbols.push(foundToken.symbol);
        tvWidget.chart().createStudy('Compare', false, false, ["open", foundToken.symbol]);
      }
    });

  }

  private loadDoubleSymbols(originTokenId: string, destinationTokenId: string, onHistoryCallback: HistoryCallback) {
    this.dataService.getRecentCoinGeckoHourlyMarketChart(originTokenId, destinationTokenId).subscribe((response) => {
      onHistoryCallback(response, { noData: false });
    })
  }

  private loadSingleSymbol(originTokenId: string, onHistoryCallback: HistoryCallback) {
    this.dataService.getRecentCoinGeckoHourlyMarketChart(originTokenId).subscribe((response) => {
      onHistoryCallback(response, { noData: false });
    })
  }

  // For Lookup  
  private joinSymbolsLists(firstSymbols: string[], secondSymbols: string[], max: number = 250) {

    let count: number = 0;
    let maxReached: boolean = false;
    let symbols: SearchSymbolResultItem[] = []
    let textSymbols: Set<string> = new Set<string>();

    // Since you only want pairs, there's no reason
    // to iterate over the last element directly
    for (let i = 0; i < firstSymbols.length; i++) {

      // This is where you'll capture that last value
      for (let j = 0; j < secondSymbols.length; j++) {

        if (count > max) {
          maxReached = true;
          break;
        }

        if (firstSymbols[i] != secondSymbols[j]) {
          textSymbols.add(`${firstSymbols[i]}/${secondSymbols[j]}`);
          count++;
        }
      }

      if (maxReached = true) break;

    }

    for (let textSymbol of textSymbols.values()) {

      symbols.push(
        {
          "symbol": textSymbol,
          "full_name": textSymbol, // e.g. BTCE:BTCUSD
          "description": textSymbol,
          "exchange": "Balancer",
          "ticker": "",
          "type": "crypto" // or "futures" or "bitcoin" or "forex" or "index"
        }
      );
    }

    return symbols;

  }


  ngOnDestroy() {
    if (this._tvWidget !== null) {
      this._tvWidget.remove();
      this._tvWidget = null;
    }
  }
}