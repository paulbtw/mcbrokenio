## McDonald's APIs

McDonald's provides APIs for different regions, each with slightly different responses and URL paths. However, they all follow the same principle. The most important endpoint is the token endpoint, where we can generate a new bearer token with our access token. For example, the URL for the EU token endpoint is https://eu-prod.api.mcd.com/v1/security/auth/token.

Each API provides either a search for the nearest stores or a full store list. The choice between these options may depend on the number of McDonald's locations in a specific country or API zone. For example, the URL for the EU store search endpoint is https://eu-prod.api.mcd.com/exp/v1/restaurant/location.

There is also an endpoint for store details, which can be accessed using the national store number. The ID is not unique across all McDonald's locations, but is only unique within a region. With this endpoint, we can see which products are available at a given store. For example, the URL for the EU store details endpoint is https://eu-prod.api.mcd.com/exp/v1/restaurant/27600353.

The above URL's will not work without the requires query parameters and headers, see the specific documentation for the API's.

Link to the [AP documentation](API/AP.md).
Link to the [EL documentation](API/EL.md).
Link to the [EU documentation](API/EU.md).
Link to the [US documentation](API/US.md).
