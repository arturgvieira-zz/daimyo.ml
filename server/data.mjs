import moment from 'moment';
import StellarSdk from 'stellar-sdk';

export default class Data {
    constructor() {
        this.state = {
            url: 'https://horizon.stellar.org',
            trades: [],
            query: [],
            assets: []
        };
        this.server = new StellarSdk.Server(this.state.url);
    }

    async get({ buy, sell }) {
        console.log('Processing...');
        await this.fetch({ buy, sell });
        if (this.state.query.length > 0) {
            const date = this.state.query.map((item) =>
                moment()
                    .utc(item.timestamp)
                    .valueOf()
            );
            const feature = this.state.query.map((item) =>
                parseFloat(item.avg)
            );

            return {
                date: [...date],
                feature: [...feature]
            };
        } else {
            return null;
        }
    }

    async fetch({ sell, buy }) {
        this.state.query = [];
        const assetInfo = (asset) =>
            this.server
                .assets(this.state.url)
                .forCode(asset)
                .call();
        let buyAsset = await assetInfo(buy);
        let sellAsset = await assetInfo(sell);

        const base =
            buy == 'XLM'
                ? new StellarSdk.Asset(buyAsset.records[0].asset_code, null)
                : new StellarSdk.Asset(
                      buyAsset.records[0].asset_code,
                      buyAsset.records[0].asset_issuer
                  );

        const counter =
            sell == 'XLM'
                ? new StellarSdk.Asset(sellAsset.records[0].asset_code, null)
                : new StellarSdk.Asset(
                      sellAsset.records[0].asset_code,
                      sellAsset.records[0].asset_issuer
                  );

        const resolution = 60000;

        const start = moment()
            .utc(Date.now())
            .subtract(120, 'minutes')
            .valueOf();
        const end = moment()
            .utc(Date.now())
            .valueOf();
        const aggregations = this.server.tradeAggregation(
            base,
            counter,
            start,
            end,
            resolution
        );
        this.state.query = (await aggregations
            .order('asc')
            .limit(200)
            .call()).records;
        if (this.state.query.length === 0) {
            const resolution = 3600000;
            const historical = moment()
                .utc(Date.now())
                .subtract(12, 'hours')
                .valueOf();
            const aggregations = this.server.tradeAggregation(
                base,
                counter,
                historical,
                end,
                resolution
            );
            this.state.query = (await aggregations
                .order('asc')
                .limit(200)
                .call()).records;
        }
    }
}
