import url from 'node:url';
import process from 'node:process';
import { globSync } from 'glob';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';
import urlPlugin from '@rollup/plugin-url';
import license from 'rollup-plugin-license';
import del from 'rollup-plugin-delete';
import emitEJS from 'rollup-plugin-emit-ejs';
import {getBabelOutputPlugin} from '@rollup/plugin-babel';
import appConfig from './app.config.js';
import {
    getPackagePath,
    getBuildInfo,
    generateTLSConfig,
    getDistPath,
} from '@dbp-toolkit/dev-utils';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const appEnv = typeof process.env.APP_ENV !== 'undefined' ? process.env.APP_ENV : 'local';
const watch = process.env.ROLLUP_WATCH === 'true';
const buildFull = (!watch && appEnv !== 'test') || process.env.FORCE_FULL !== undefined;
let useTerser = buildFull;
let useBabel = buildFull;
let checkLicenses = buildFull;
let useHTTPS = false;

console.log('APP_ENV: ' + appEnv);

let config;
if (appEnv in appConfig) {
    config = appConfig[appEnv];
} else if (appEnv === 'test') {
    config = {
        basePath: '/',
        entryPointURL: 'https://test',
        keyCloakBaseURL: 'https://test',
        keyCloakRealm: '',
        keyCloakClientId: '',
        matomoUrl: '',
        matomoSiteId: -1,
    };
} else {
    console.error(`Unknown build environment: '${appEnv}', use one of '${Object.keys(appConfig)}'`);
    process.exit(1);
}

function getOrigin(url) {
    if (url) return new URL(url).origin;
    return '';
}

config.CSP = `default-src 'self' 'unsafe-eval' 'unsafe-inline' \
https://eid.egiz.gv.at ${getOrigin(config.matomoUrl)} ${getOrigin(
    config.keyCloakBaseURL
)} ${getOrigin(config.entryPointURL)}; \
img-src * blob: data:`;

export default (async () => {
    let privatePath = await getDistPath(pkg.name);
    return {
        input:
            appEnv != 'test'
                ? ['src/' + pkg.internalName + '.js', 'src/dbp-authentic-image-request.js']
                : globSync('test/**/*.js'),
        output: {
            dir: 'dist',
            entryFileNames: '[name].js',
            chunkFileNames: 'shared/[name].[hash].[format].js',
            format: 'esm',
            sourcemap: true,
        },
        // external: ['zlib', 'http', 'fs', 'https', 'url'],
        onwarn: function (warning, warn) {
            // ignore chai warnings
            if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('/chai/')) {
                return;
            }
            // keycloak bundled code uses eval
            if (warning.code === 'EVAL' && warning.id.includes('sha256.js')) {
                return;
            }
            warn(warning);
        },
        plugins: [
            del({
                targets: 'dist/*',
            }),
            emitEJS({
                src: 'assets',
                include: ['**/*.ejs', '**/.*.ejs'],
                data: {
                    getUrl: (p) => {
                        return url.resolve(config.basePath, p);
                    },
                    getPrivateUrl: (p) => {
                        return url.resolve(`${config.basePath}${privatePath}/`, p);
                    },
                    name: pkg.internalName,
                    entryPointURL: config.entryPointURL,
                    keyCloakServer: config.keyCloakServer,
                    keyCloakBaseURL: config.keyCloakBaseURL,
                    keyCloakClientId: config.keyCloakClientId,
                    keyCloakRealm: config.keyCloakRealm,
                    CSP: config.CSP,
                    matomoUrl: config.matomoUrl,
                    matomoSiteId: config.matomoSiteId,
                    buildInfo: getBuildInfo(appEnv),
                },
            }),
            resolve({
                browser: true,
                preferBuiltins: true,
            }),
            checkLicenses &&
                license({
                    banner: {
                        commentStyle: 'ignored',
                        content: `
License: <%= pkg.license %>
Dependencies:
<% _.forEach(dependencies, function (dependency) { if (dependency.name) { %>
<%= dependency.name %>: <%= dependency.license %><% }}) %>
`,
                    },
                    thirdParty: {
                        allow(dependency) {
                            let licenses = [
                                'LGPL-2.1-or-later', 'MIT', 'BSD-3-Clause', 'Apache-2.0', 'BSD',
                            ];
                            if (!licenses.includes(dependency.license)) {
                                throw new Error(`Unknown license for ${dependency.name}: ${dependency.license}`);
                            }
                            return true;
                        },
                    },
                }),
            commonjs({
                include: 'node_modules/**',
            }),
            json(),
            urlPlugin({
                limit: 0,
                include: ['node_modules/suggestions/**/*.css', 'node_modules/select2/**/*.css'],
                emitFiles: true,
                fileName: 'shared/[name].[hash][extname]',
            }),
            copy({
                targets: [
                    {src: 'assets/silent-check-sso.html', dest: 'dist'},
                    {src: 'assets/htaccess-shared', dest: 'dist/shared/', rename: '.htaccess'},
                    {src: 'src/*.metadata.json', dest: 'dist'},
                    {src: 'assets/*.css', dest: 'dist/' + (await getDistPath(pkg.name))},
                    {src: 'assets/*.svg', dest: 'dist/' + (await getDistPath(pkg.name))},
                    {src: 'assets/icon/*', dest: 'dist/' + (await getDistPath(pkg.name, 'icon'))},
                    {src: 'assets/site.webmanifest', dest: 'dist', rename: pkg.internalName + '.webmanifest'},
                    {
                        src: await getPackagePath('@tugraz/font-source-sans-pro', 'files/*'),
                        dest: 'dist/' + (await getDistPath(pkg.name, 'fonts/source-sans-pro')),
                    },
                    {
                        src: await getPackagePath('@dbp-toolkit/common', 'src/spinner.js'),
                        dest: 'dist/' + (await getDistPath(pkg.name)),
                    },
                    {
                        src: await getPackagePath('@tugraz/web-components', 'src/spinner.js'),
                        dest: 'dist/' + (await getDistPath(pkg.name)), rename: 'tug_spinner.js'
                    },
                    {
                        src: await getPackagePath('@dbp-toolkit/common', 'src/spinner.js'),
                        dest: 'dist/' + (await getDistPath(pkg.name)),
                    },
                    {
                        src: await getPackagePath('@dbp-toolkit/common', 'misc/browser-check.js'),
                        dest: 'dist/' + (await getDistPath(pkg.name)),
                    },
                    {
                        src: await getPackagePath('@dbp-toolkit/common', 'assets/icons/*.svg'),
                        dest: 'dist/' + (await getDistPath('@dbp-toolkit/common', 'icons')),
                    },
                ],
            }),
            useBabel &&
                getBabelOutputPlugin({
                    compact: false,
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                loose: true,
                                modules: false,
                                shippedProposals: true,
                                bugfixes: true,
                                targets: {
                                    esmodules: true,
                                },
                            },
                        ],
                    ],
                }),
            useTerser ? terser() : false,
            watch
                ? serve({
                      contentBase: '.',
                      host: '127.0.0.1',
                      port: 8001,
                      historyApiFallback: config.basePath + pkg.internalName + '.html',
                      https: useHTTPS ? await generateTLSConfig() : false,
                      headers: {
                          'Content-Security-Policy': config.CSP,
                      },
                  })
                : false,
        ],
    };
})();
