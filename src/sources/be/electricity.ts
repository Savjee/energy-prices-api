import { PriceFetcher } from "../../PriceFetcher";
import { median } from "../../utils/median";

const BASE_URL = "https://griddata.elia.be/eliabecontrols.prod"
					+ "/interface/Interconnections/daily/auctionresults/";

export default class BelgiumElectricity extends PriceFetcher{
	async fetchPrice() {
		const today = new Date().toISOString().substring(0, 10);
		const url = BASE_URL + today;

		const req = await fetch(url, {
			method: "GET",
			headers: {
				"Accept": "application/json"
			},
			cf: {
				cacheKey: url,
				cacheTtl: this.cacheTimes.apiRequest,
			}
		});

		const priceData = await req.json();
		if(!Array.isArray(priceData)){
			return new Response(JSON.stringify({
				error: "No valid response from Elia",
			}), {
				status: 503,
			});
		}

		console.log("Got data: " + JSON.stringify(priceData));

		const count = priceData.length;
		const values = priceData.map((el) => el.price);

		const sum = values.reduce((prev, curr) => prev + curr, 0);		

		const avg = sum / count;
		const med = median(values);

		console.log("median", med);
		console.log("avg", avg);

		// Device by 1000 to convert MWh to kWh
		return new Response(JSON.stringify({
			avg: avg / 1000,
			median: med / 1000,
		}));
	}
}
