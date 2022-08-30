/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

const BASE_URL = "https://griddata.elia.be/eliabecontrols.prod/interface/Interconnections/daily/auctionresults/";

const median = (arr: number[]) => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {


		const today = new Date().toISOString().substring(0, 10);
		const url = BASE_URL + today;

		console.log("Making request to", url);
		const req = await fetch(url, {
			method: "GET",
			headers: {
				"Accept": "application/json"
			},
			cf: {
				// Cache result for 1 hour (in seconds) if it was successful
				cacheTtlByStatus: {
					"200-299": 1*60*60,
				}
			}
		});

		const priceData = await req.json();
		if(!Array.isArray(priceData)){
			return new Response("error");
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
	},
};
