export abstract class PriceFetcher{
	cacheTimes = {
		apiRequest: 1*60*60,
		browser: 1*60*60,
	}

	request: Request;

	constructor(request: Request){
		this.request = request;
	}

	abstract fetchPrice(): Promise<Response>;
}
