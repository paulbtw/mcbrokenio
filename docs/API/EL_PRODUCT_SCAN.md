# EL product scan guide

This guide is for agents updating McBroken product codes for EL/GMaL
McDonald's markets.

## Goal

Find product IDs for:

- `IceType.MILCHSHAKE`
- `IceType.MCFLURRY`
- `IceType.MCSUNDAE`

Update `packages/mclogik/src/constants/CountryInfos/El.ts` only after checking
live menu data and excluding bundle-only IDs.

## Required inputs

Use local environment values from `.env`:

- `KEY`: required by the `api.me2-prd.gmal.app` locationfinder endpoint.
- `BASIC_TOKEN_EL`: required to obtain the EL bearer token.

Do not print or commit these values. Store raw scan output under `.context/`.

## Endpoints

Fetch store IDs:

```text
GET https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/{country}/{locale}?acceptOffers=all&lab=false&key={KEY}
```

Fetch an EL bearer token:

```text
POST https://el-prod.api.mcd.com/v1/security/auth/token
authorization: Basic {BASIC_TOKEN_EL}
content-type: application/x-www-form-urlencoded; charset=UTF-8
```

Derive `mcd-clientid` from the basic token:

```js
Buffer.from(BASIC_TOKEN_EL, 'base64').toString('utf8').split(':')[0]
```

Fetch a restaurant menu:

```text
GET https://el-prod.api.mcd.com/exp/v1/menu/gmal/restaurants/{restaurantID}/menus
authorization: Bearer {token}
mcd-clientid: {clientId}
mcd-sourceapp: GMAL
```

Validate status behavior:

```text
GET https://el-prod.api.mcd.com/exp/v1/menu/gmal/restaurants/{restaurantID}/status
authorization: Bearer {token}
mcd-clientid: {clientId}
mcd-sourceapp: GMAL
```

The status response is not exhaustive. It only lists products currently out of
stock in `productOutages.productIDs`.

## Menu parsing

The menu response separates product metadata from localized labels.

Product metadata:

```text
channelMenus.channels.{channel}.productLookup.{productID}
```

Localized product text:

```text
channelMenus.localizations.{locale}.lookup.{productID}
channelMenus.localizations.{locale}.strings
```

For each channel and locale:

1. Iterate `localizations.*.lookup`.
2. Keep entries whose ID exists in the channel `productLookup`.
3. Resolve lookup numeric indexes through `localizations.*.strings`.
4. Match the joined localized text against product-family patterns.

Suggested patterns:

```text
MCFLURRY:    /mc\s*flurry|mcflurry|flurry/i
MCSUNDAE:    /sundae|mc\s*sundae|mcsundae/i
MILCHSHAKE:  /milk\s*shake|milkshake|(^|[^a-z])shake([^a-z]|$)/i
```

## Filtering rules

Prefer IDs where:

- `type` is `ITEM`
- `familyGroup` is product-like, such as `DESSERT` or `SHAKES`
- The localized name is a direct product, not just a meal/bundle containing the
  product

Usually exclude:

- `type=MEAL`
- obvious bundles, such as `Big Mac with McFlurry`
- obvious free/reward placeholders unless status data proves they are needed

Use judgment for `familyGroup=UNDEFINED`: some EL markets use valid mobile app
product IDs with this family. Check the localized text and status outages.

## Updating config

In `CountryInfos/El.ts`:

- Store all product codes as strings.
- Use `['UNAVAILABLE']` when a trackable country has no menu products for that
  family.
- Keep `[]` only for countries that are not status-polled, such as location-only
  countries with no `mobileString`.

After updating, run:

```text
pnpm --filter @mcbroken/db db:generate
pnpm --filter @mcbroken/mclogik check-types
pnpm --filter @mcbroken/mclogik lint
pnpm --filter @mcbroken/mclogik test
```

## Common pitfalls

- The locationfinder endpoint returns 403/404-like failures without `KEY`.
- `/status` cannot discover all product IDs; use `/menus` for discovery.
- Menus vary by store, channel, and locale. Scan multiple stores; full scans are
  best for trackable markets.
- Some countries have store lists but no usable menu/status endpoint. As of the
  June 2026 scan, `PH` and `TR` are location-only because menu/status returned
  `404`.
- Use conservative concurrency, such as 8-10 requests, and keep raw artifacts in
  `.context/`.
