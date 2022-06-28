# Authentic documents activities

Here you can find the individual activities of the `greenlight` app. If you want to use the whole app look at [greenlight](https://gitlab.tugraz.at/dbp/greenlight/greenlight).

## Usage of an activity

You can use every activity alone. Take a look at our examples [here](https://gitlab.tugraz.at/dbp/greenlight/greenlight/-/tree/main/examples).


## Activities

### Shared Attributes

These attributes are available for all activities listed here:

- `lang` (optional, default: `de`): set to `de` or `en` for German or English
    - example `lang="de"`
- `entry-point-url` (optional, default is the TU Graz entry point url): entry point url to access the api
    - example `entry-point-url="https://api-dev.tugraz.at"`
- `auth` object: you need to set that object property for the auth token
    - example auth property: `{token: "THE_BEARER_TOKEN"}`
    - note: most often this should be an attribute that is not set directly, but subscribed at a provider

### dbp-authentic-image-request

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

#### Attributes

See [shared attributes](#shared-attributes).
