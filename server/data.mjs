import Event from 'events';
import request from 'request-promise';
import moment from 'moment';
import _ from 'lodash';
import StellarSdk from 'stellar-sdk';

export default class Data extends Event.EventEmitter {
    constructor() {
        super();
        this.state = {
            url: 'https://horizon.stellar.org',
            trades: [],
            query: [],
            assets: []
        };
        this.server = new StellarSdk.Server(this.state.url);
    }

    async get({ buy, sell }) {
        let result = {
            date: [],
            feature: []
        };
        let data = this.state.assets.find((d) => d.code === sell);
        const trades = data ? data.trades.filter((e) => e.pair === buy) : null;

        if (trades && trades.length > 0) {
            trades.map((f) => {
                result.date.push(
                    moment()
                        .utc(f.date)
                        .valueOf()
                );
                result.feature.push(f.base_amount / f.counter_amount / 100);
            });
        } else {
            result = await this.fetch({ buy, sell });
        }

        return result;
    }

    async fetch({ sell, buy }) {
        this.state.query = [];
        const urlAsset = (asset) =>
            `${this.state.url}/assets?asset_code=${asset}`;
        let assetBuy, assetSell;
        if (buy !== 'XLM') assetBuy = JSON.parse(await request(urlAsset(buy)));
        else assetBuy = 'native';
        if (sell !== 'XLM')
            assetSell = JSON.parse(await request(urlAsset(sell)));
        else assetSell = 'native';

        let result = `${this.state.url}/trade_aggregations?${
            assetBuy !== 'native'
                ? `base_asset_issuer=${
                      assetBuy._embedded.records[0].asset_issuer
                  }&base_asset_type=${
                      assetBuy._embedded.records[0].asset_type
                  }&base_asset_code=${buy}`
                : 'base_asset_type=native'
        }${
            assetSell !== 'native'
                ? `&counter_asset_issuer=${
                      assetSell._embedded.records[0].asset_issuer
                  }&counter_asset_type=${
                      assetSell._embedded.records[0].asset_type
                  }&counter_asset_code=${sell}`
                : '&counter_asset_type=native'
        }&limit=200&order=asc&resolution=86400000&start_time=${moment()
            .utc(Date.now())
            .subtract(200, 'days')
            .valueOf()}&end_time=${moment()
            .utc(Date.now())
            .valueOf()}`;

        await request(result)
            .then((response) => {
                return JSON.parse(response);
            })
            .then(async (json) => {
                const trades = json._embedded.records.map((item) => item);
                this.state.query = trades.concat(this.state.trades);
                // if (result) console.log('Data Query: ', result);
                // return json._links.next && json._links.next.href;
            });
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
}
