import { PriceFetcher } from "../../PriceFetcher";

const BASE_URL = "https://business.engie.be/api/engie/be/gems/b2b-pricing/v1/public/prices/endex?market=BPB_POWER,TFM_GAS";

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
		const gasPrices = priceData.find((e: any) => e.name === "TFM");

		if(!gasPrices){
			return new Response(JSON.stringify({
				error: "No valid response from Engie",
			}), {
				status: 503,
			});
		}

		const lastPrice = gasPrices.prices.periodicPrices.find(e => e.granularity === "MONTHLY").prices[0].value

		const price = lastPrice / 94.79;
		return new Response(JSON.stringify({
			price: price,
			unit: "m3",
		}));
	}
}
