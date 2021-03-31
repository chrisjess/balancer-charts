export interface IToken {
    address: string;
    balance: string;
    decimals: number;
    denormWeight: string;
    //From Coingecko
    name: string;
    symbol: String;
    logoURI: string;
}

export class Token implements IToken {
    id: string; // From CoinGecko
    address: string;
    balance: string;
    decimals: number;
    denormWeight: string;
    name: string;
    coinGeckoName: string;
    symbol: string;
    logoURI: string;
    platforms: { [name: string]: string } = {};

    constructor(token: Partial<Token> = {}) {
        this.id = token.id ? token.id : '';
        this.address = token.address ? token.address : '';
        this.balance = token.balance ? token.balance : '';
        this.decimals = token.decimals ? token.decimals : 0;
        this.denormWeight = token.denormWeight ? token.denormWeight : '';
        this.name = token.name ? token.name : '';
        this.coinGeckoName = token.coinGeckoName ? token.coinGeckoName : '';
        this.symbol = token.symbol ? token.symbol : '';
        this.logoURI = token.logoURI ? token.logoURI : '';
        this.platforms = token.platforms ? token.platforms : {};
    }

    get symbolName(): string {
        return `${this.symbol} ${this.name}`;
    }

    get hexColor(): string {
        if (!this.address) return;
        return '#' + this.address.substring(2, 8);
    }

    get poolWeight() {
        return parseFloat(this.denormWeight) * 2;
    }

}

export interface IPool {
    id: string;
    swapFee: string;
    tokens: Token[];
    totalWeight: string;
}

export class Pool implements IPool {
    id: string;
    swapFee: string;
    totalWeight: string;
    tokens: Token[]

    constructor(pool: Partial<Pool> = {}) {

        this.id = pool.id;
        this.swapFee = pool.swapFee;
        this.totalWeight = pool.totalWeight;

        // Sort tokens by denormWeight for display, rather that computing in the frontend many times
        if (pool.tokens && pool.tokens.length > 0) {
            const sortedTokens: Token[] = pool.tokens.sort((a: Token, b: Token) => (parseInt(a.denormWeight) < parseInt(b.denormWeight) ? 1 : -1));
            this.tokens = sortedTokens.map(token => new Token(token));
        } else {
            pool.tokens = [];
        }
    }

    get tokenCount() {
        return this.tokens.length;
    }

}

export interface IChartBar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export class ChartBar implements IChartBar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;

    public constructor(chartBar: Partial<ChartBar> = {}) {
        this.time = chartBar.time;
        this.open = chartBar.open;
        this.high = chartBar.high ? chartBar.high : chartBar.open;
        this.low = chartBar.low ? chartBar.low : chartBar.open;
        this.close = chartBar.close ? chartBar.close : chartBar.open;
        this.volume = chartBar.volume;
    }

}