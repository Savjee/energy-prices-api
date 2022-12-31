import { PriceFetcher } from "../../PriceFetcher";

const BASE_URL = "https://www.theice.com/marketdata/DelayedMarkets.shtml?getIntradayChartDataAsJson=&marketId=5493476";

export default class BelgiumGas extends PriceFetcher{
	async fetchPrice() {
		const req = await fetch(BASE_URL, {
			method: "GET",
			headers: {
				"Accept": "application/json"
			},
			cf: {
				cacheKey: BASE_URL,
				cacheTtl: this.cacheTimes.apiRequest,
			}
		});

		const priceData: any = await req.json();
		const lastPrice = priceData?.lastPrice;

		if(!lastPrice){
			return new Response(JSON.stringify({
				error: "No valid response from The Ice",
			}), {
				status: 503,
			});
		}

		const price = lastPrice / 94.79;
		return new Response(JSON.stringify({
			price: price,
			unit: "m3",
		}));
	}
}
