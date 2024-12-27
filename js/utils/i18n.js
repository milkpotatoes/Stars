/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT License
 */

const DEFAULT_LANG = 'default';
let DEFAULT_RESOURCE = null;
let DEFAULT_FETCHING = null;
const DEFAULT_REPLACE_TARGET = Symbol('default')

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

const getParams = (res) => {
    const matches = []; // {index: number, data: string, replace: {[index: string]: string,}}
    let sliced = "";
    for (let i = 0, index = 0, opened = false; i < res.length; i++) {
        const k = res[i];
        const lastKey = i > 0 ? res[i - 1] : '';
        const data = matches[index];
        if (k === '{' && lastKey !== '\\' && !opened) {
            opened = true;
            matches.push({ index: -1, data: '', replace: {} });
            sliced += '{';
        } else if (opened) {
            if (k === '}' && lastKey !== '\\') {
                opened = false;
                index++;
                sliced += '}';
            } else {
                data.data += k;
            }
        } else {
            sliced += k
        }
    }
    return [matches, sliced];
};

const parseIndex = (param) => {
    let ret = param.data.match(/^\d+($|:)/g);
    if (ret !== null) {
        ret = ret[0];
        if (ret.endsWith(':')) {
            let arr;
            [ret, ...arr] = param.data.split(':');
            param.data = arr.join(':')
        } else {
            param.data = '';
        }
        param.index = parseInt(ret);
    }
}

const parseRules = (param) => {
    let rules = param.data.split(';');
    for (let i = 0; i < rules.length; i++) {
        let k = rules[i];
        if (k.endsWith('\\')) {
            const next = rules[i + 1] ?? '';
            rules[i] += ';' + next;
            rules.slice(i);
        }
    }
    rules.map((value) => {
        if (value === '') {
            return;
        }
        if (value.indexOf('=') > 0) {
            let [k, ...v] = value.split('=');
            param.replace[k] = v.join('=');
        } else if (!Object.hasOwn(param.replace, DEFAULT_REPLACE_TARGET)) {
            param.replace[DEFAULT_REPLACE_TARGET] = value;
        } else {
            throw new Error('invalid format string');
        }
    });
    if (!Object.hasOwn(param.replace, DEFAULT_REPLACE_TARGET)) {
        param.replace[DEFAULT_REPLACE_TARGET] = '@';
    }
}

const formatRule = (rules, arg) => {
    for (let rule in rules.replace) {
        if (arg == rule) {
            return rules.replace[rule].replace(/([^\\])@/g, '$1' + (arg ?? ''));
        }
    }
    return rules.replace[DEFAULT_REPLACE_TARGET].replace(/(?=[^\\])@/g, (arg ?? ''))
}

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
            })
            .catch(() => {
                this._resource_ = DEFAULT_RESOURCE;
            })
            .finally(() => {
                this.i18nHtml();
            });
    };
    static i18nText(text, ...args) {
        if (!text) {
            return;
        }
        if (text instanceof Text) {
            text.textContent = this.i18nString(text.textContent);
        }
    };
    static i18nString(string, ...args) {
        const keys = string.match(/\{\{([\w\d\-]+?)\}\}/g);
        if (!keys) {
            return string;
        }
        keys.forEach((k, i) => {
            keys[i] = k.replace(/\{\{([\w\d\-]+?)\}\}/, '$1');
        });
        const uniqueKeys = new Set(keys);
        for (const key of uniqueKeys) {
            if (!Object.hasOwn(this._resource_, key)) {
                string = string.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), key.replace(/\-/g, ' '));
                continue;
            }
            const [matches, sliced] = getParams(this._resource_[key]);
            let result = sliced;
            const indexed = [];
            for (let data of matches) {
                parseIndex(data);
                parseRules(data);
                if (data.index != -1) {
                    indexed[data.index] = true;
                }
            }
            for (let i = 0, index = 0; i < matches.length; i++) {
                const data = matches[i];
                if (data.index >= 0) {
                    continue;
                }
                while (indexed[index]) {
                    index++;
                }
                indexed[index] = true;
                data.index = index;
            }
            for (let data of matches) {
                result = result.replace(/(?=[^\\])\{\}/, formatRule(data, args[data.index]));
            }
            string = string.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), result);
        }
        return string;
    };
    static i18nElement(elem, ...args) {
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
        document.documentElement.lang = this._resource_.__html_lang_tag__;
        const elements = document.querySelectorAll('.i18n-text');
        for (let i = 0; i < elements.length; i++) {
            this.i18nElement(elements[i]);
        }
    };
    static i18nAny(text, ...args) {
        if (!text) {
            return;
        };
        if (text instanceof HTMLElement) {
            return this.i18nElement(text, ...args);
        }
        else if (text instanceof Text) {
            return this.i18nText(text, ...args);
        }
        else if (typeof text === 'string') {
            return this.i18nString(text, ...args);
        }
    };
};

export const $i18n = I18N.i18nAny.bind(I18N);