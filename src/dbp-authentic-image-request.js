import {createI18nInstance} from './i18n.js';
import {css, html, LitElement} from 'lit-element';
import {ScopedElementsMixin} from '@open-wc/scoped-elements';
import * as commonUtils from 'dbp-common/utils';
import {Button, Icon, MiniSpinner} from 'dbp-common';
import * as commonStyles from 'dbp-common/styles';
import {TextSwitch} from './textswitch.js';
import { send } from 'dbp-common/notification';

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
        this.responseFromServer = '';
        this.items = [];
        this.disableBtns = false;
        this.gridContainer = "display:none";
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
            responseFromServer: { type: String, attribute: false },
            items: { type: Array, attribute: false },
            disableBtns: { type: Boolean, attribute: false },
            gridContainer: { type: String, attribute: false },
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

    parseAvailableDocumentTypes() {
        let numTypes = parseInt(this.responseFromServer['hydra:totalItems']);
        if (isNaN(numTypes)) {
            numTypes = 0;
        }

        for (let i = 0; i < numTypes; i++ ) {
            let entry = this.responseFromServer['hydra:member'][i];

            if (entry['availabilityStatus'] !== 'not_available') {
                this.items[i] = entry['urlSafeAttribute'];
            }
        }
    }

    async httpGetAsync(url, options)
    {
        let response = await fetch(url, options).then(result => {
            if (!result.ok) throw result;
            return result.json();
        }).catch(error => {
                console.log("fetch error:", error);
            });

        return response;
    }

    parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    async retrieveToken() {
        let response;

        //Retrieve token from KC
        const options_get_access_token = {
            headers: {
                Authorization: "Bearer " + window.DBPAuthToken
            }
        };
        response = await this.httpGetAsync('https://auth-dev.tugraz.at/auth/realms/tugraz/broker/eid-oidc/token', options_get_access_token);

        if (response && response.access_token) {
            this.access_token = response.access_token;
            this.fullResponse = this.parseJwt(response.id_token);
            this.family_name = this.fullResponse.family_name;
            this.given_name = this.fullResponse.given_name;
            this.realFullResponse = response;
        }

        console.log(response);

        //Retrieve a list of available document types
        const options_send_api_request_doc_types = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                'Authorization': 'Bearer ' + window.DBPAuthToken
            }};

        const url = this.entryPointUrl + '/authentic_document_types?page=1&token=' + 'photo-jpeg-available-token'; //TODO: replace token

        if (this.access_token !== '') {
            this.responseFromServer = await this.httpGetAsync(url, options_send_api_request_doc_types);
        }

        this.parseAvailableDocumentTypes();
        this.gridContainer = "display:flex";

        /*
        //Retrieve document
        const options_send_api_request_for_type = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                'Authorization': 'Bearer ' + window.DBPAuthToken,
            }
        };

        const url_document = this.entryPointUrl + '/authentic_documents/' + 'cGhvdG8tanBlZy1hdmFpbGFibGU%253D' + '?token=' + 'photo-jpeg-available-token'; //TODO: replace id; token

        if (this.access_token !== '') {
            this.responseFromServer2 = await this.httpGetAsync(url_document, options_send_api_request_for_type);
        }
        */
    }

    buttonPressSuccessMessage() {
        this.disableBtns = true;
        send({
            "summary": i18n.t('authentic-image-request.request-success-title'),
            "body": i18n.t('authentic-image-request.request-success-body', { name: this.name }),
            "type": "success",
            "timeout": 10,
        });
    }

    static get styles() {
        // language=css
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getButtonCSS()}
            ${commonStyles.getNotificationCSS()}
            
            #docs {
                display: block;
                margin-block-start: 1em;
                margin-block-end: 1em;
                margin-inline-start: 0px;
                margin-inline-end: 0px;
            }
            
            .border {
                border-top: 1px solid black;
            }
            
            #grid-container {
                margin-top: 2rem;
                padding-top: 2rem;
                display: flex;
                flex-flow: column;
            }
            
            h2:first-child {
                margin-top: 0px;
            }

            h2 {
                margin-bottom: 10px;
            }
        `;
    }

    render() {
        return html`
           <h2>${i18n.t('authentic-image-request.title')}</h2>
           <p>${i18n.t('authentic-image-request.description')}</p>
           <button class="button is-primary" @click="${this.retrieveToken}" title="${i18n.t('authentic-image-request.request-button')}">${i18n.t('authentic-image-request.retrieve-token')}</button>
           
           <div id="grid-container" class="border" style="${this.gridContainer}">
                <h2 id="doc-headline" >${i18n.t('authentic-image-request.available-documents')} ${this.given_name} ${this.family_name}:</h2>
                <div id="docs">
                    ${this.items.map(i => html`<p>${i}</p><button class="button is-primary" @click="${this.buttonPressSuccessMessage}" title="${i}" ?disabled="${this.disableBtns}" >${i18n.t('authentic-image-request.request-document')}</button>`)}
                </div>
           </div>
        `;
    }
}

commonUtils.defineCustomElement('dbp-authentic-image-request', AuthenticImageRequest);
