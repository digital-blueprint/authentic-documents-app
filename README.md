# Authentic Documents Application

[GitLab Repository](https://gitlab.tugraz.at/dbp/authentic-documents/authenticdocument) |
[npmjs package](https://www.npmjs.com/package/@dbp-topics/authentic-document) |
[Unpkg CDN](https://unpkg.com/browse/@dbp-topics/authentic-document/) |
[Authentic Document Bundle](https://gitlab.tugraz.at/dbp/authentic-documents/api-authentic-document-bundle)

With dbp authentic documents you can request official documents from a government registry and release them to third parties.

This is a **WORK IN PROGRESS** and not meant for public use yet!

## Prerequisites

- You need the [API server](https://gitlab.tugraz.at/dbp/relay/dbp-relay-server-template) running
- You need the [Authentic Document Bundle](https://gitlab.tugraz.at/dbp/authentic-documents/api-authentic-document-bundle)

## Local development

```bash
# get the source
git clone git@gitlab.tugraz.at:dbp/authentic-documents/authenticdocument.git
cd authenticdocument
git submodule update --init

# install dependencies
yarn install

# constantly build dist/bundle.js and run a local web-server on port 8001 
yarn run watch

# run tests
yarn test
```

Jump to <http://localhost:8001> and you should get a Single Sign On login page.

## Using this app as pre-built package

### Install app

If you want to install the DBP Authentic Document App in a new folder `authentic-document-app` with a path prefix `/` you can call:

```bash
npx @digital-blueprint/cli install-app authentic-document authentic-document-app /
```

Afterwards you can point your Apache web-server to `authentic-document-app/public`.

Make sure you are allowing `.htaccess` files in your Apache configuration.

Also make sure to add all of your resources you are using (like your API and Keycloak servers) to the
`Content-Security-Policy` in your `authentic-document-app/public/.htaccess`, so the browser allows access to those sites.

You can also use this app directly from the [Unpkg CDN](https://unpkg.com/browse/@dbp-topics/authentic-document/)
for example like this: [dbp-authentic-document/index.html](https://gitlab.tugraz.at/dbp/authentic-documents/authentic-document/-/tree/main/examples/dbp-authentic-document/index.html)

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

### Update app

If you want to update the DBP Authentic Document App in the current folder you can call:

```bash
npx @digital-blueprint/cli update-app authentic-document
```

## Activities

This app has the following activities:
- `dbp-authentic-image-request`

You can find the documentation of these activities in the [authentic documents activities documentation](https://gitlab.tugraz.at/dbp/authentic-documents/authenticdocument/-/tree/main/src).

## Adapt app

### Functionality

You can add multiple attributes to the `<dbp-greenlight>` tag.

| attribute name | value | Link to description |
|----------------|-------| ------------|
| `provider-root` | Boolean | [app-shell](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/app-shell#attributes) |
| `lang`         | String | [language-select](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/language-select#attributes) | 
| `entry-point-url` | String | [app-shell](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/app-shell#attributes) |
| `keycloak-config` | Object | [app-shell](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/app-shell#attributes) |
| `base-path` | String | [app-shell](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/app-shell#attributes) |
| `src` | String | [app-shell](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/app-shell#attributes) |
| `html-overrides` | String | [common](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/common#overriding-slots-in-nested-web-components) |
| `themes` | Array | [theme-switcher](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/theme-switcher#themes-attribute) |
| `darkModeThemeOverride` | String | [theme-switcher](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/theme-switcher#themes-attribute) |

#### Mandatory attributes

If you are not using the `provider-root` attribute to "terminate" all provider attributes
you need to manually add these attributes so that the topic will work properly:

```html
<dbp-authentic-document
    auth
    requested-login-status
    analytics-event
>
</dbp-authentic-document>
```

### Design

For frontend design customizations, such as logo, colors, font, favicon, and more, take a look at the [theming documentation](https://dbp-demo.tugraz.at/dev-guide/frontend/theming/).

## "dbp-authentic-document" slots

These are common slots for the app-shell. You can find the documentation of these slots in the [app-shell documentation](https://gitlab.tugraz.at/dbp/web-components/toolkit/-/tree/main/packages/app-shell).
For the app specific slots take a look at the [authentic documents activities](https://gitlab.tugraz.at/dbp/authentic-documents/authenticdocument/-/tree/main/src).
