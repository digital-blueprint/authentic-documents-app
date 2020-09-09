import {createI18nInstance} from './i18n.js';
import {css, html, LitElement} from 'lit-element';
import {ScopedElementsMixin} from '@open-wc/scoped-elements';
import * as commonUtils from 'dbp-common/utils';
import {Button, Icon, MiniSpinner} from 'dbp-common';
import * as commonStyles from 'dbp-common/styles';
import {TextSwitch} from './textswitch.js';

const i18n = createI18nInstance();

class AuthenticImageRequest extends ScopedElementsMixin(LitElement) {
    constructor() {
        super();
        this.lang = i18n.language;
        this.entryPointUrl = commonUtils.getAPiUrl();
        this.access_token = '';
        this.given_name = '';
        this.family_name = '';
        this.fullResponse = '';
        this.entryPointUrl = commonUtils.getAPiUrl();
        this.responseFromServer = '';
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
            access_token: { type: String, attribute: false },
            given_name: { type: String, attribute: false },
            family_name: { type: String, attribute: false },
            fullResponse: { type: String, attribute: false },
            responseFromServer: { type: String, attribute: false }
        };
    }

    connectedCallback() {
        super.connectedCallback();
    }

    update(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case "lang":
                    i18n.changeLanguage(this.lang);
                    break;
            }
            super.update(changedProperties);
            // console.log(propName, oldValue);
        });

    }

    async httpGetAsync(url, options)
    {
        let response = await fetch(url, options);

        return await response.json();
    }

    parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };

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
            this.fullRespons = this.parseJwt(response.id_token);
            this.family_name = this.fullRespons.family_name;
            this.given_name = this.fullRespons.given_name;

        }
        console.log(response);
        console.log("token", this.access_token);


        const options2 = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ld+json',
                'Authorization': 'Bearer ' + window.DBPAuthToken,
            },
            body: JSON.stringify({
                'token': this.access_token,
                'type': 'image',
            })};
        this.entryPointUrl = this.entryPointUrl + '/authentic_document_requests';
        if (this.access_token !== '') {
            this.responseFromServer = await this.httpGetAsync(this.entryPointUrl, options2);
        }
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
           
           <h2>Hallo ${this.given_name} ${this.family_name}! </h2>
           <pre><code> ${JSON.stringify(this.responseFromServer, undefined, 4)} </code></pre>
           <p> ${this.access_token} </p><br>
           <pre><code> ${JSON.stringify(this.fullRespons, undefined, 4)} </code></pre>
           <!-- <button class="button is-primary" title="${i18n.t('authentic-image-request.request-button')}">${i18n.t('authentic-image-request.request-button')}</button>-->
        `;
    }
}

commonUtils.defineCustomElement('dbp-authentic-image-request', AuthenticImageRequest);
