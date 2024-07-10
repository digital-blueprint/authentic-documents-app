export default {
    local: {
        basePath: '/dist/',
        entryPointURL: 'http://127.0.0.1:8000',
        keyCloakBaseURL: 'https://auth-dev.tugraz.at/auth',
        keyCloakRealm: 'tugraz-vpu',
        keyCloakClientId: 'auth-dev-mw-frontend-local',
        matomoUrl: 'https://analytics.tugraz.at/',
        matomoSiteId: 131,
    },
    development: {
        basePath: '/apps/authentic-documents/',
        entryPointURL: 'https://api-dev.tugraz.at',
        keyCloakBaseURL: 'https://auth-dev.tugraz.at/auth',
        keyCloakRealm: 'tugraz-vpu',
        keyCloakClientId: 'dbp-authentic-documents',
        matomoUrl: 'https://analytics.tugraz.at/',
        matomoSiteId: 131,
    },
    demo: {
        basePath: '/apps/authentic-documents/',
        entryPointURL: 'https://api-demo.tugraz.at',
        keyCloakBaseURL: 'https://auth-demo.tugraz.at/auth',
        keyCloakRealm: 'tugraz-vpu',
        keyCloakClientId: 'dbp-authentic-documents',
        matomoUrl: 'https://analytics.tugraz.at/',
        matomoSiteId: 131,
    }
};
