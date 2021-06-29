# Authentic Document Application

[GitLab Repository](https://gitlab.tugraz.at/dbp/authentic-documents/authenticdocument) |
[npmjs package](https://www.npmjs.com/package/@dbp-topics/authentic-document) |
[Unpkg CDN](https://unpkg.com/browse/@dbp-topics/authentic-document/)

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

Not only you can use this app as pre-built package installed from [npmjs](https://www.npmjs.com/package/@dbp-topics/authentic-document) via:

```bash
npm install @dbp-topics/authentic-document
```

But you can also use this app directly from the [Unpkg CDN](https://unpkg.com/browse/@dbp-topics/authentic-document/)
for example like this:

```html
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicons -->
    <link rel="shortcut icon" type="image/x-icon" href="https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/local/@dbp-topics/authentic-document/favicon.ico">
    <link rel="icon" type="image/svg+xml" href="https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/local/@dbp-topics/authentic-document/favicon.svg" sizes="any">

    <!-- PWA manfiest file -->
    <link rel="manifest" href="https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/dbp-authentic-document.manifest.json">

    <!-- Loading spinner -->
    <script type="module">
        import {Spinner} from 'https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/local/@dbp-topics/authentic-document/spinner.js';
        customElements.define('dbp-loading-spinner', Spinner);
    </script>

    <!-- App bundles-->
    <script type="module" src="https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/dbp-authentic-document.js"></script>

    <!-- Prevent Chrome/Edge from suggesting to translate the page -->
    <meta name="google" content="notranslate">

    <!-- Font related CSS -->
    <style>
        @import "https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/local/@dbp-topics/authentic-document/fonts/source-sans-pro/300.css";
        @import "https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/local/@dbp-topics/authentic-document/fonts/source-sans-pro/400.css";
        @import "https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/local/@dbp-topics/authentic-document/fonts/source-sans-pro/600.css";

        body {
            font-family: 'Source Sans Pro', 'Calibri', 'Arial', 'sans-serif';
            font-weight: 300;
            margin: 0;
        }

        /* TU-Graz style override */
        html {
            --dbp-override-primary-bg-color: #245b78;
            --dbp-override-primary-button-border: solid 1px #245b78;
            --dbp-override-info-bg-color: #245b78;
            --dbp-override-danger-bg-color: #e4154b;
            --dbp-override-warning-bg-color: #ffe183;
            --dbp-override-warning-text-color: black;
            --dbp-override-success-bg-color: #259207;
        }
    </style>

    <!-- Preloading/Preconnecting -->
    <link rel="preconnect" href="https://mw-dev.tugraz.at">
    <link rel="preconnect" href="https://auth-dev.tugraz.at/auth">
</head>

<body>
<dbp-authentic-document
        lang="de" entry-point-url="https://mw-dev.tugraz.at"
        auth
        requested-login-status
        analytics-event
        src="https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/dbp-authentic-document.topic.metadata.json"
        base-path="/"
        keycloak-config='{"url": "https://auth-dev.tugraz.at/auth", "realm": "tugraz", "clientId": "auth-dev-mw-frontend-local", "silentCheckSsoRedirectUri": "./silent-check-sso.html", "idpHint": "eid-oidc"}'
        env='local'
        matomo-url="https://analytics.tugraz.at/"
        matomo-site-id="131"
><dbp-loading-spinner></dbp-loading-spinner></dbp-authentic-document>
<!-- Error handling for too old browsers -->
<script src="https://unpkg.com/@dbp-topics/authentic-document@1.0.1/dist/local/@dbp-topics/authentic-document/browser-check.js" defer></script>
<noscript>Diese Applikation benötigt Javascript / This application requires Javascript</noscript>
</body>
</html>
```

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

## Design Note
To ensure a uniform and responsive design the activity should occupy 100% of the window width when the activity width is less than 768 px.
