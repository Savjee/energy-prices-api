/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { PriceFetcher } from "./PriceFetcher";
import BelgiumElectricity from "./sources/be/electricity";
import BelgiumGas from "./sources/be/gas";

export interface Env {
}

const routing: RouterMap[] = [
	{ country: "be", electricity: BelgiumElectricity, gas: BelgiumGas, }
];

interface RouterMap {
	country: "be"
	electricity: new (r: Request) => PriceFetcher,
	gas: new (r: Request) => PriceFetcher,
}

export default {
	async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {

		console.log(request.url);
		const url = new URL(request.url);
		const path = url.pathname.substring(1);
		const { 0: country, 1: energy } = path.split("/");

		if(!energy || energy !== "electricity" && energy !== "gas"){
			return new Response(null, {
				status: 404,
			});
		}

		// Try to find what the user wants
		const countryObj = routing.find(el => el.country === country);
		if(!countryObj){
			return new Response(null, {
				status: 404,
			});
		}

		const priceFetcher = new countryObj[energy](request);
		const response = await priceFetcher.fetchPrice();

		// Allow the browser to cache the result as well
		response.headers.set("Cache-Control", 
													"max-age=" + priceFetcher.cacheTimes.browser);

		return response;
	},

	async scheduled(event: any, env: any, ctx: any) {
	    ctx.waitUntil(async () => {
	    	for(const country of routing){
	    		const gas = new country.gas(event);
	    		const elec = new country.electricity(event);

	    		await gas.fetchPrice();
	    		await elec.fetchPrice();
	    	}
	    });
	},
};
