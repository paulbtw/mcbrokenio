# McBroken

McBroken tracks whether McDonald's stores can currently sell selected ice-cream products across supported markets.

## Language

**Market**:
A McDonald's commercial area whose stores share Product Availability configuration, such as US or AU.
_Avoid_: Country, location

**Catalog Scope**:
A scheduled geographic slice of a Market used by a Store Catalog Refresh, such as US2 or AU2. A Market may have one or more Catalog Scopes.
_Avoid_: Location, country list

**Availability Poll**:
A recurring evaluation of product availability for eligible stores in one or more markets.
_Avoid_: Item status job, status poll

**Product Availability**:
The calculated availability of a tracked product category at a store, including available, partially available, unavailable, not applicable, and unknown outcomes.
_Avoid_: Item status

**Store Catalog**:
The known McDonald's stores for supported markets, including their identity, location, and mobile-ordering capability.
_Avoid_: POS list, store list

**Store Catalog Refresh**:
A recurring reconciliation of the Store Catalog with McDonald's market discovery sources.
_Avoid_: Get all stores, store-list job

**Published Availability Snapshot**:
The public marker and aggregate-statistics representations of store availability derived from one coherent view of the Store Catalog.
_Avoid_: JSON export, create JSON

## Contract boundaries

- Domain services use branded `MarketCode` and `CatalogScope` values. Raw strings and legacy `countryList`/`countries` event fields are translated in Lambda adapters.
- `snapshot.json` schema version 2 uses `market`. The legacy `stats.json` file deliberately retains `country` until the compatibility rollout is complete.
- Sentry batch summaries use Market terminology and receive only sanitized, allowlisted upstream failure metadata.
