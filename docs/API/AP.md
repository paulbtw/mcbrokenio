# AP
## This API only works with a near Australian IP

## Endpoints 

### Token

`https://ap-prod.api.mcd.com/v1/security/auth/token`

This enpoint will generate a new Bearer Token that is valid for 15 minutes

##### Headers

| Name          | Description                  | Required | Example                                            |
|---------------|------------------------------|----------|----------------------------------------------------|
| authorization | The basic token for this API | Yes      | `Basic <Token>`                                    |
| content-type  | Content type of the request  | Yes      | `application/x-www-form-urlencoded; charset=UTF-8` |


### Store Search

`https://ap-prod.api.mcd.com/exp/v1/restaurant/location`

This endpoint will return a list of stores near the given coordinates


### Store Details

`https://ap-prod.api.mcd.com/exp/v1/restaurant/950167`

This endpoint will return the details of a store with the given ID


## Country Codes and Mobile Ordering Strings

#### ap-prod:

| Country   | Code | Mobile Ordering | Mobile Ordering String |
|-----------|------|-----------------|------------------------|
| Australia | AU   | true            | MOBILEORDERS           |

#### ap

| Country   | Code | Mobile Ordering | Mobile Ordering String |
|-----------|------|-----------------|------------------------|
| Hong Kong | HK   | true            | MOBILEORDERS           |
