/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

const DEFAULT_LANG = 'default';
let DEFAULT_RESOURCE = null;
let DEFAULT_FETCHING = null;

const getDefaultResource = async () => {
    if (DEFAULT_RESOURCE !== null) {
        return DEFAULT_RESOURCE;
    } else if (DEFAULT_FETCHING !== null) {
        return DEFAULT_FETCHING;
    } else {
        DEFAULT_FETCHING = fetch(`resource/strings/${DEFAULT_LANG}.json`)
            .then(res => {
                if (res.ok) {
                    return res.json();
                };
                console.error('default i18n config is not exist');
            })
            .then(json => {
                DEFAULT_RESOURCE = json;
                return json;
            });
        return DEFAULT_FETCHING;
    }
}

getDefaultResource();

export class I18N {
    static _resource_ = {};
    static setLang(lang = DEFAULT_LANG) {
        fetch(`resource/strings/${lang}.json`)
            .then(async res => {
                if (res.ok) {
                    return res.json();
                } else {
                    return await getDefaultResource();
                }
            })
            .then(json => {
                this._resource_ = json;
            }).catch(() => {
                this._resource_ = DEFAULT_RESOURCE;
            }).finally(() => {
                this.i18nHtml();
            });
    };
    static i18nText(text) {
        if (!text) {
            return;
        }
        if (text instanceof Text) {
            text.textContent = this.i18nString(text.textContent);
        }
    };
    static i18nString(string) {
        const keys = string.match(/\{\{([\w\d\-]+?)\}\}/g);
        if (!keys) {
            return string;
        }
        keys.forEach((k, i) => {
            keys[i] = k.replace(/\{\{([\w\d\-]+?)\}\}/, '$1');
        });
        const uniqueKeys = new Set(keys);
        for (const key of uniqueKeys) {
            if (key in this._resource_) {
                string = string.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), this._resource_[key]);
            } else {
                string = string.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), key.replace(/\-/g, ' '));
            }
        }
        return string;
    };
    static i18nElement(elem) {
        if (!elem) {
            return;
        }
        if (elem instanceof HTMLElement) {
            const { childNodes } = elem;
            if (childNodes.length > 0) {
                for (let i = 0; i < childNodes.length; i++) {
                    const child = childNodes[i];
                    if (child instanceof HTMLElement) {
                        this.i18nElement(child);
                    } else if (child instanceof Text) {
                        this.i18nText(child);
                    }
                }
            } else {
                if (elem instanceof HTMLInputElement || elem instanceof HTMLTextAreaElement) {
                    elem.value = this.i18nString(elem.value);
                    elem.placeholder = this.i18nString(elem.placeholder);
                }
            }
            return;
        }
    };
    static i18nHtml() {
        const elements = document.querySelectorAll('.i18n-text');
        for (let i = 0; i < elements.length; i++) {
            this.i18nElement(elements[i]);
        }
    };
    static i18nAny(arg) {
        if (!arg) {
            return;
        };
        if (arg instanceof HTMLElement) {
            return this.i18nElement(arg);
        }
        else if (arg instanceof Text) {
            return this.i18nText(arg);
        }
        else if (typeof arg === 'string') {
            return this.i18nString(arg);
        }
    };
};

export const $i18n = I18N.i18nAny.bind(I18N);