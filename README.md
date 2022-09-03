# Energy Price API

Simple API that returns the price for gas and electricity. Currently only supports Belgium 🇧🇪 but I'm open to pull requests!.

## Usage

Get gas prices:
```
GET https://energy-prices.savjee.workers.dev/be/gas
```

Response:
```json
{
	"price":2.3989239371241693,
	"unit":"m3"
}
```

Get electricity price:
```
GET https://energy-prices.savjee.workers.dev/be/electricity
```

Response:
```json
{
	"avg":0.3301816666666666,
	"median":0.30147
}
```

The API is a Cloudflare Worker that makes requests to the datasources (PowerNext and Elia) and caches the results for 1 hour.

## Integration with Home Assistant
Want to use this API in your Home Assistant instance? Simply include these RESTful sensors:

```
- platform: rest
    resource: https://energy-prices.savjee.workers.dev/be/gas
    method: GET
    name: Gas wholesale price
    value_template: >-
      {{ value_json.price | round(2) }}
    device_class: monetary
    state_class: measurement
    unit_of_measurement: "€/m³"
    scan_interval: 3600  # 1 hour

  - platform: rest
    resource: >-
      https://energy-prices.savjee.workers.dev/be/electricity
    method: GET
    name: Electricity wholesale price
    value_template: >-
      {{ value_json.avg | round(2) }}
    device_class: monetary
    state_class: measurement
    unit_of_measurement: "€/kWh"
    scan_interval: 3600  # 1 hour
```


## Wishlist

- [ ] Support more countries
- [ ] Version the API to prevent breaking changes in the future
- [ ] Have a uniform response format and document the units we're using