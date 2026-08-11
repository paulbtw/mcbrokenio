# Publish one canonical availability snapshot

The map and statistics are two views of the same Store Catalog read, so publishing and fetching them independently can expose a mixture of generations. We publish `snapshot.json` as the canonical, versioned representation containing `schemaVersion`, `publishedAt`, `markers`, and `statistics`; schema version 2 names the commercial grouping `market`. The frontend fetches it through one shared query cache entry and derives both views locally.

The publisher writes the canonical object first, then writes `marker.json` and `stats.json` sequentially as temporary compatibility representations. Legacy `stats.json` retains its `country` field only at that boundary. Any write failure rejects the invocation so a retry can idempotently publish the complete generation.

Frontend and publisher deployment order is not guaranteed. While the compatibility files remain, a `403` or `404` for `snapshot.json` therefore causes the frontend to fetch `marker.json` and `stats.json` and translate them into the v2 in-memory contract. Other snapshot errors remain visible and are not masked by fallback. Remove this fallback only after production publication of `snapshot.json` has been verified.
