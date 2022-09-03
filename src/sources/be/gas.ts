import { PriceFetcher } from "../../PriceFetcher";
import { median } from "../../utils/median";

const BASE_URL = "https://www.powernext.com/data-feed/1467707/819/17";

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
		const pricePerDay = priceData?.values[0]?.data;

		if(!pricePerDay || !Array.isArray(pricePerDay)){
			return new Response(JSON.stringify({
				error: "No valid response from PowerNext",
			}), {
				status: 503,
			});
		}

		const lastDay = pricePerDay[pricePerDay.length -1];
		const price = lastDay.y / 94.79;

		return new Response(JSON.stringify({
			price: price,
			unit: "m3",
		}));
	}
}
