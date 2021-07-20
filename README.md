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

### Install app

If you want to install the DBP Authentic Document App in a new folder `authentic-document-app` you can call:

```bash
npx @digital-blueprint/cli install-app authentic-document authentic-document-app
```

Afterwards you can point your Apache web-server to `authentic-document-app/public`.

You can also use this app directly from the [Unpkg CDN](https://unpkg.com/browse/@dbp-topics/authentic-document/)
for example like this: [dbp-authentic-document/index.html](https://gitlab.tugraz.at/dbp/authentic-documents/authentic-document/-/tree/master/examples/dbp-authentic-document/index.html)

Note that you will need a Keycloak server along with a client id for the domain you are running this html on.

### Update app

If you want to update the DBP Authentic Document App in the current folder you can call:

```bash
npx @digital-blueprint/cli update-app authentic-document
```

## Design Note

To ensure a uniform and responsive design the activity should occupy 100% of the window width when the activity width is less than 768 px.
