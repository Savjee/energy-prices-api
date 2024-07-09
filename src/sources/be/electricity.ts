import { PriceFetcher } from "../../PriceFetcher";
import { median } from "../../utils/median";

const BASE_URL = "https://business.engie.be/api/engie/be/gems/b2b-pricing/v1/public/prices/endex?market=BPB_POWER,TFM_GAS";

export default class BelgiumElectricity extends PriceFetcher{
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
		const electricityPrice = priceData.find((e: any) => e.name === 'TFM');

		if(!electricityPrice){
			return new Response(JSON.stringify({
				error: "No valid response from Engie",
			}), {
				status: 503,
			});
		}

		const lastPrice = electricityPrice
							.prices
							.periodicPrices
							.find((e: any) => e.granularity === 'MONTHLY')
							.prices[0]
							.value / 1000;

		return new Response(JSON.stringify({
			avg: lastPrice,
			median: lastPrice,
			unit: "€/kWh"
		}));
	}
}
