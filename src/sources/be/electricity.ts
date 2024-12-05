import { PriceFetcher } from "../../PriceFetcher";
import { median } from "../../utils/median";

export default class BelgiumElectricity extends PriceFetcher{
	async fetchPrice() {
		const now = new Date();
		const BASE_URL = "https://graphql.frankenergie.nl";
		const QUERY = `
			query MarketPrices {
				marketPrices(date:"${now.toISOString().substring(0,10)}") {
					electricityPrices {
						from
						till
						marketPrice
						marketPriceTax
						sourcingMarkupPrice
						energyTaxPrice
						perUnit
					}
				}
			}
		`;

		const req = await fetch(BASE_URL, {
			method: "POST",
			body: JSON.stringify({ query: QUERY }),
			headers: {
				"content-type":"application/json",
				"x-country": "BE",
			},
			cf: {
				cacheKey: BASE_URL,
				cacheTtl: this.cacheTimes.apiRequest,
			}
		});

		// Get the price data from the response
		const priceData: any = await req.json();
		const hourPrices = priceData.data.marketPrices.electricityPrices;

		// Find the price for the current time
		const currentPrice = hourPrices.find((el: any) => {
			const from = new Date(el.from);
			const to = new Date(el.till);
			return now >= from && now < to;
		});

		if(!currentPrice){
			return new Response(JSON.stringify({
				error: "No valid response from FrankEnergie",
			}), {
				status: 503,
			});
		}

		const totalPrice = currentPrice.marketPrice + currentPrice.marketPriceTax;
		return new Response(JSON.stringify({
			avg: totalPrice,
			median: totalPrice,
			unit: "€/kWh"
		}));
	}
}
