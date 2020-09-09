import {createI18nInstance} from './i18n.js';
import {css, html, LitElement} from 'lit-element';
import {ScopedElementsMixin} from '@open-wc/scoped-elements';
import * as commonUtils from 'dbp-common/utils';
import * as utils from './utils';
import {Button, Icon, MiniSpinner} from 'dbp-common';
import * as commonStyles from 'dbp-common/styles';
import {classMap} from 'lit-html/directives/class-map.js';
import JSONLD from "dbp-common/jsonld";
import {TextSwitch} from './textswitch.js';

const i18n = createI18nInstance();

class AuthenticImageRequest extends ScopedElementsMixin(LitElement) {
    constructor() {
        super();
        this.lang = i18n.language;
        this.entryPointUrl = commonUtils.getAPiUrl();
        this.access_token = '';
    }

    static get scopedElements() {
        return {
          'dbp-icon': Icon,
          'dbp-mini-spinner': MiniSpinner,
          'dbp-button': Button,
          'dbp-textswitch': TextSwitch,
        };
    }

    static get properties() {
        return {
            lang: { type: String },
            entryPointUrl: { type: String, attribute: 'entry-point-url' },
        };
    }

    connectedCallback() {
        super.connectedCallback();
    }

    update(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            if (propName === "lang") {
                i18n.changeLanguage(this.lang);
            }
        });

        super.update(changedProperties);
    }

    async httpGetAsync(url, options)
    {

        let response = await fetch(url, options);
        let data = await response.json();
        return data;
    }

    async retrieveToken() {
        let response;
        const options1 = {
            headers: {
                Authorization: "Bearer " + window.DBPAuthToken
            }
        };
        response = await this.httpGetAsync('https://auth-dev.tugraz.at/auth/realms/tugraz/broker/eid-oidc/token', options1);
        if (response && response.access_token) {
            this.access_token = response.access_token;
        }
        console.log("token", this.access_token);


        // hier kommt request hin
    }

    static get styles() {
        // language=css
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getButtonCSS()}
            ${commonStyles.getNotificationCSS()}
           
        `;
    }

    render() {
        return html`
           <h2>${i18n.t('authentic-image-request.title')}</h2>
           <p>${i18n.t('authentic-image-request.description')}</p>
           <button class="button is-primary" @click="${this.retrieveToken}" title="${i18n.t('authentic-image-request.request-button')}">retrieve token</button>
           <!-- <button class="button is-primary" title="${i18n.t('authentic-image-request.request-button')}">${i18n.t('authentic-image-request.request-button')}</button> -->
        `;
    }
}

commonUtils.defineCustomElement('dbp-authentic-image-request', AuthenticImageRequest);
