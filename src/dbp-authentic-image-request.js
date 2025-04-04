import {createInstance} from './i18n.js';
import {css, html} from 'lit';
import {ScopedElementsMixin} from '@dbp-toolkit/common';
import * as commonUtils from '@dbp-toolkit/common/utils';
import {Button, Icon, MiniSpinner} from '@dbp-toolkit/common';
import * as commonStyles from '@dbp-toolkit/common/styles';
import {TextSwitch} from './textswitch.js';
import {send} from '@dbp-toolkit/common/notification';
import {AdapterLitElement} from '@dbp-toolkit/common';
import {Activity} from './activity.js';
import metadata from './dbp-authentic-image-request.metadata.json';

class AuthenticImageRequest extends ScopedElementsMixin(AdapterLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.auth = {};
        this.lang = this._i18n.language;
        this.entryPointUrl = '';
        this.access_token = '';
        this.given_name = '';
        this.family_name = '';
        this.fullResponse = '';
        this.responseFromServer = '';
        this.itemsAvailable = [];
        this.itemsRequested = [];
        this.itemsNotAvailable = [];
        this.gridContainer = 'display:none';
        this.imageSrc = null;
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
            ...super.properties,
            lang: {type: String},
            entryPointUrl: {type: String, attribute: 'entry-point-url'},
            access_token: {type: String, attribute: false},
            given_name: {type: String, attribute: false},
            family_name: {type: String, attribute: false},
            fullResponse: {type: String, attribute: false},
            responseFromServer: {type: String, attribute: false},
            itemsAvailable: {type: Array, attribute: false},
            itemsRequested: {type: Array, attribute: false},
            itemsNotAvailable: {type: Array, attribute: false},
            gridContainer: {type: String, attribute: false},
            imageSrc: {type: String, attribute: false},
            auth: {type: Object},
        };
    }

    connectedCallback() {
        super.connectedCallback();
    }

    update(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'lang':
                    this._i18n.changeLanguage(this.lang);
                    break;
            }
            // console.log(propName, oldValue);
        });
        super.update(changedProperties);
    }

    parseAvailableDocumentTypes() {
        for (let i = 0; i < this.responseFromServer['hydra:member'].length; i++) {
            let entry = this.responseFromServer['hydra:member'][i];

            if (entry['availabilityStatus'] === 'available') {
                this.itemsAvailable[i] = entry;
            } else if (entry['availabilityStatus'] === 'requested') {
                this.itemsRequested[i] = entry;
            } else {
                this.itemsNotAvailable[i] = entry;
            }
        }
    }

    async httpGetAsync(url, options) {
        let response = await fetch(url, options).then((result) => {
            if (!result.ok) throw result;
            return result.json();
        });

        return response;
    }

    parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );

        return JSON.parse(jsonPayload);
    }

    async retrieveToken() {
        let response;

        //Retrieve token from KC
        const options_get_access_token = {
            headers: {
                Authorization: 'Bearer ' + this.auth.token,
            },
        };

        response = await this.httpGetAsync(
            'https://auth-dev.tugraz.at/auth/realms/tugraz-vpu/broker/eid-oidc/token',
            options_get_access_token
        );

        if (response && response.access_token) {
            // XXX: demo
            response.access_token = 'photo-jpeg-available-token';

            this.access_token = response.access_token;
            this.fullResponse = this.parseJwt(response.id_token);
            this.family_name = this.fullResponse.family_name;
            this.given_name = this.fullResponse.given_name;
        }
        console.log(this.access_token);
        //Retrieve a list of available document types
        const options_send_api_request_doc_types = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                Authorization: 'Bearer ' + this.auth.token,
                Token: this.access_token,
            },
        };

        const url = this.entryPointUrl + '/authentic_document_types?page=1';

        if (this.access_token !== '') {
            try {
                this.responseFromServer = await this.httpGetAsync(
                    url,
                    options_send_api_request_doc_types
                );
            } catch (e) {
                if (e.status == 403) {
                    send({
                        body: 'eid token expired',
                        type: 'danger',
                        timeout: 10,
                    });
                }
                throw e;
            }
        }

        this.parseAvailableDocumentTypes();
        this.gridContainer = 'display:flex';

        /*
        //Retrieve document
        const options_send_api_request_for_type = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/ld+json',
                'Authorization': 'Bearer ' + this.auth.token,
            }
        };

        const url_document = this.entryPointUrl + '/authentic_documents/' + 'cGhvdG8tanBlZy1hdmFpbGFibGU%253D' + '?token=' + 'photo-jpeg-available-token'; //TODO: replace id; token

        if (this.access_token !== '') {
            this.responseFromServer2 = await this.httpGetAsync(url_document, options_send_api_request_for_type);
        }
        */
    }

    async buttonPressSuccessMessage(event, entry) {
        this.shadowRoot.getElementById('btn-' + entry['identifier']).setAttribute('disabled', '');

        let url = this.entryPointUrl + '/authentic_document_requests';

        let body = {
            typeId: entry['identifier'],
            token: this.access_token,
        };

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.auth.token,
                'Content-Type': 'application/json',
                Token: this.access_token,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            this.shadowRoot
                .getElementById('btn-' + entry['identifier'])
                .removeAttribute('disabled');
            return;
        }

        let data = await response.json();
        let arrivalDate = new Date(data['estimatedTimeOfArrival']);
        console.log(arrivalDate.toLocaleString());

        send({
            summary: this._i18n.t('authentic-image-request.request-success-title'),
            body: this._i18n.t('authentic-image-request.request-success-body', {
                name: entry['name'],
            }),
            type: 'success',
            timeout: 10,
        });
    }

    async buttonPressShowDocument(event, data) {
        const options = {
            headers: {
                Authorization: 'Bearer ' + this.auth.token,
                Accept: 'application/ld+json',
                Token: this.access_token,
            },
        };
        this.imageSrc = null;
        let url = this.entryPointUrl + '/authentic_documents/' + data['identifier'];
        let resp = await this.httpGetAsync(url, options);
        this.imageSrc = resp['contentUrl'];
    }

    static get styles() {
        // language=css
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS(false)}
            ${commonStyles.getButtonCSS()}
            ${commonStyles.getNotificationCSS()}
            
            #documents {
                display: grid;
                grid-template-columns: repeat(3, max-content);
                column-gap: 15px;
                row-gap: 1.5em;
                align-items: center;
                margin-top: 2em;
                margin-bottom: 2em;
            }

            .header {
                display: grid;
                align-items: center;
                grid-template-columns: 1fr auto;
                gap: 10px;
            }

            .border {
                border-top: var(--dbp-border);
            }

            #grid-container {
                margin-top: 2rem;
                padding-top: 2rem;
                display: flex;
                flex-flow: column;
            }

            h2:first-child {
                margin-top: 0px;
                margin-bottom: 0px;
            }

            h2 {
                margin-bottom: 10px;
            }

            .subheadline {
                font-style: italic;
                padding-left: 2em;
                margin-top: -1px;
                /*line-height: 1.8;*/
                margin-bottom: 1.2em;
            }
        `;
    }

    render() {
        const activity = new Activity(metadata);
        const i18n = this._i18n;

        return html`
            <h2>${i18n.t('authentic-image-request.title')}</h2>
            <p class="subheadline">${activity.getDescription(this.lang)}</p>
            <p>${i18n.t('authentic-image-request.description')}</p>
            <button
                class="button is-primary"
                @click="${this.retrieveToken}"
                title="${i18n.t('authentic-image-request.request-button')}">
                ${i18n.t('authentic-image-request.retrieve-token')}
            </button>

            <div id="grid-container" class="border" style="${this.gridContainer}">
                <h3 id="doc-headline">
                    ${i18n.t('authentic-image-request.available-documents')} ${this.given_name}
                    ${this.family_name}:
                </h3>
                <div id="documents">
                    ${this.itemsRequested.map(
                        (i) => html`
                            <span class="header">
                                <strong>${i['name']}</strong>
                                ${i18n.t('authentic-image-request.request-text')}.
                            </span>
                            <button
                                id="btn-${i['identifier']}"
                                class="button is-primary"
                                @click="${(e) => this.buttonPressSuccessMessage(e, i)}">
                                ${i18n.t('authentic-image-request.request-document')}
                            </button>
                            <button class="button is-primary" disabled>
                                ${i18n.t('authentic-image-request.show-document')}
                            </button>
                        `
                    )}
                    ${this.itemsAvailable.map(
                        (i) => html`
                            <span class="header">
                                <strong>${i['name']}</strong>
                                ${i18n.t('authentic-image-request.available-text')}.
                            </span>
                            <button
                                id="btn-${i['identifier']}"
                                class="button is-primary"
                                @click="${(e) => this.buttonPressSuccessMessage(e, i)}">
                                ${i18n.t('authentic-image-request.request-document')}
                            </button>
                            <button
                                class="button is-primary"
                                @click="${(e) => this.buttonPressShowDocument(e, i)}">
                                ${i18n.t('authentic-image-request.show-document')}
                            </button>
                        `
                    )}
                    ${this.itemsNotAvailable.map(
                        (i) => html`
                            <span class="header">
                                <strong>${i['name']}</strong>
                                ${i18n.t('authentic-image-request.not-available-text')}.
                            </span>
                            <button id="btn-${i['identifier']}" class="button is-primary" disabled>
                                ${i18n.t('authentic-image-request.request-document')}
                            </button>
                            <button class="button is-primary" disabled>
                                ${i18n.t('authentic-image-request.show-document')}
                            </button>
                        `
                    )}
                </div>
            </div>
            ${this.imageSrc
                ? html`
                      <img src="${this.imageSrc}" />
                  `
                : ``}
        `;
    }
}

commonUtils.defineCustomElement('dbp-authentic-image-request', AuthenticImageRequest);
