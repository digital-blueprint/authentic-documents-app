export default {
    local: {
        basePath: '/dist/',
        entryPointURL: 'http://127.0.0.1:8000',
        keyCloakBaseURL: 'https://auth-dev.tugraz.at/auth',
        keyCloakClientId: 'auth-dev-mw-frontend-local',
        matomoUrl: 'https://analytics.tugraz.at/',
        matomoSiteId: 131,
    },
    development: {
        basePath: '/apps/authenticdocument/',
        entryPointURL: 'https://mw-dev.tugraz.at',
        keyCloakBaseURL: 'https://auth-dev.tugraz.at/auth',
        keyCloakClientId: 'authenticdocument-dev_tugraz_at-AUTHENTICDOCUMENT',
        matomoUrl: 'https://analytics.tugraz.at/',
        matomoSiteId: 131,
    },
    demo: {
        basePath: '/apps/authenticdocument/',
        entryPointURL: 'https://api-demo.tugraz.at',
        keyCloakBaseURL: 'https://auth-test.tugraz.at/auth',
        keyCloakClientId: 'authenticdocument-demo_tugraz_at',
        matomoUrl: 'https://analytics.tugraz.at/',
        matomoSiteId: 131,
    },
    production: {
        basePath: '/',
        entryPointURL: 'https://api.tugraz.at',
        keyCloakBaseURL: 'https://auth.tugraz.at/auth',
        keyCloakClientId: 'authenticdocument_tugraz_at',
        matomoUrl: 'https://analytics.tugraz.at/',
        matomoSiteId: 131,
    },
};