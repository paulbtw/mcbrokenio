## el-prod:

### only works with EU IP

### Store-list endpoint testing

The `api.me2-prd.gmal.app` locationfinder endpoints require the configured
`KEY` query parameter. Test country/locale combinations with:

```text
https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/{country}/{locale}?acceptOffers=all&lab=false&key={KEY}
```

Product codes were checked through the authenticated menu endpoint by joining
`channelMenus.channels.*.productLookup` with
`channelMenus.localizations.*.lookup` / `strings`:

```text
https://el-prod.api.mcd.com/exp/v1/menu/gmal/restaurants/{restaurantID}/menus
```

Newly confirmed working locationfinder markets:

| Country      | Code | Locale | Restaurants | Mobile Ordering Label Observed | Tracking                                      |
| ------------ | ---- | ------ | ----------- | ------------------------------ | --------------------------------------------- |
| Azerbaijan   | AZ   | az-az  | 33          | Mobil sifariş və ödəmə         | milkshake, McFlurry, McSundae from menu scan  |
| Oman         | OM   | en-gb  | 34          | Mobile order and pay           | McFlurry and McSundae from menu scan          |
| Philippines  | PH   | en-ph  | 932         |                                | location only; menu/status 404                 |
| Qatar        | QA   | en-gb  | 84          | Mobile order and pay           | McFlurry and McSundae from menu scan          |
| Turkey       | TR   | tr-tr  | 346         | Mobil sipariş ve ödeme         | location only; menu/status 404                 |
| South Africa | ZA   | en-za  | 423         | Mobile order and pay           | milkshake, McFlurry, McSundae from menu scan  |

| Country              | Code | Mobile Ordering | Mobile Ordering String          |
| -------------------- | ---- | --------------- | ------------------------------- |
| Austria              | AT   | true            | Mobil bestellen und bezahlen    |
| Azerbaijan           | AZ   | true            | Mobil sifariş və ödəmə          |
| Bahrain              | BH   | false           |                                 |
| Belarus              | BY   | false           |                                 |
| Belgium              | BE   | false           |                                 |
| Bosnia               | BA   | false           |                                 |
| Bulgaria             | BG   | false           |                                 |
| Croatia              | HR   | false           |                                 |
| Cyprus               | CY   | true            | Mobile order and pay            |
| Czech                | CZ   | false           |                                 |
| Denmark              | DK   | true            | Mobil bestilling og betaling    |
| Egypt                | EG   | false           |                                 |
| El Salvador          | SV   | false           |                                 |
| Estonia              | EE   | true            | Mobile order and pay            |
| Finland              | FI   | true            | Mobiilitilaus ja maksu          |
| France               | ?    | false           |                                 |
| Georgia              | GE   | false           |                                 |
| Greece               | GR   | false           |                                 |
| Guatemala            | GT   | false           |                                 |
| Honduras             | HN   | false           |                                 |
| Hungary              | HU   | false           |                                 |
| Indonesia            | ID   | false           |                                 |
| Ireland              | IE   | false           |                                 |
| Italy                | IT   | true            | Ordina e paga dal cellulare     |
| Jordan               | JO   | false           |                                 |
| Kazakhstan           | KZ   | false           |                                 |
| Kuwait               | KW   | false           |                                 |
| Latvia               | LV   | false           |                                 |
| Libanon              | LB   | false           |                                 |
| Lithuania            | LT   | false           |                                 |
| Malaysia             | MY   | true            | Mobile order and pay            |
| Malta                | MT   | false           |                                 |
| Mauritius            | MU   | false           |                                 |
| Morocco              | MA   | false           |                                 |
| New Zealand          | NZ   | false           |                                 |
| Nicaragua            | NI   | false           |                                 |
| Norway               | NO   | true            | Mobil bestilling og betaling    |
| Oman                 | OM   | true            | Mobile order and pay            |
| Pakistan             | PK   | false           |                                 |
| Philippines          | PH   | false           |                                 |
| Paraguay             | PY   | false           |                                 |
| Poland               | PL   | true            | Zamów i odbierz                 |
| Portugal             | PT   | true            | Pedidos Mobile                  |
| Qatar                | QA   | true            | Mobile order and pay            |
| Reunion              | RE   | false           |                                 |
| Romania              | RO   | false           |                                 |
| Serbia               | RS   | false           |                                 |
| Singapore            | SG   | true            | Mobile order and pay            |
| Slovenia             | SI   | false           |                                 |
| South Africa         | SAR  | false           |                                 |
| South Korea          | KR   | false           |                                 |
| Spain                | ES   | true            | MyMcDonald's Pide y Paga        |
| Sweden               | SE   | true            | Mobil beställning och betalning |
| Swiss                | CH   | true            | Mobil bestellen und bezahlen    |
| Thailand             | TH   | false           |                                 |
| Turkey               | TR   | false           |                                 |
| United Arab Emirates | AE   | true            | Mobile order and pay            |
| Ukraine              | UA   | false           |                                 |
| Vietnam              | VN   | false           |                                 |
| South Africa         | ZA   | true            | Mobile order and pay            |
