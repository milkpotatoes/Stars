const ALERT_STYLE = ':host { color: #333; display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0; --primary-color: #3f51b5; --accent-color: #448AFF; --background-color: #FF4081; --default-transation: ease-in-out .2s; font-family: Roboto, Noto, Helvetica, Arial, sans-serif; z-index: 10; opacity: 1 !important; } .overlay { width: 100%; height: 100%; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0 0 0 / .2); transition: var(--default-transation); } .dismiss.overlay { opacity: 0; } .dialog { background: #fff; position: fixed; transform: translate(-50%, -50%); top: 50%; left: 50%; width: calc(100% - 96px); max-width: 560px; z-index: 1; box-shadow: 0 16px 20px -8px rgba(0 0 0 / .5); border-radius: 2px; padding: 16px; transition: var(--default-transation); } .dismiss.dialog { top: 60%; left: 50%; scale: .8; opacity: 0; transform: translate(-62.5%, -62.5%); } .title { margin: 0 0 16px 0; font-size: 1.1em; } .message { font-size: 0.9em; margin: 0 0 16px 0; line-height: 1.6em; color: rgba(0 0 0 / .75); } .buttons { display: grid; grid-template-columns: 56px 1fr 56px 56px; grid-template-areas: "m . n p"; } .buttons>.button { padding: 0px 12px; box-sizing: border-box; height: 32px; border: none; outline: none; background: transparent; transition: ease-in-out .2s; border-radius: 2px; color: var(--background-color); font-size: 1em; min-width: 56px; width: max-content; font-weight: bold; box-shadow: none;} .buttons>.button:hover { background: rgba(0 0 0 / .1); } .buttons>.button:active { background: rgba(0 0 0 / .2); } .positive-button { grid-area: p; } .negative-button { grid-area: n; } .netural-button { grid-area: m; }';
const ALERT_STYLE_URL = URL.createObjectURL(new Blob([ALERT_STYLE]));
const WIDGETS_STYLE = ':root { --primary-color: #3f51b5; --accent-color: #448AFF; --background-color: #FF4081; --default-transation: ease-in-out .2s } select, textarea, input { outline: none; border: none; width: 100%; font-size: 1em; border-bottom: solid 1px #aaa; padding: 0 4px; transition: var(--default-transation); background: linear-gradient(var(--background-color), var(--background-color)) 2px 10px no-repeat; background-position: 50% 100%; background-size: 0 1px; box-sizing: border-box; resize: none; font-family: Roboto, Noto, Helvetica, Arial, sans-serif; min-height: 32px; line-height: 32px; height: 32px; } select[disabled], textarea[disabled], input[disabled] { border-bottom: dashed 1px #bbb !important; background: transparent; } input[type="file"] { margin-left: 32px; width: calc(100% - 32px); } input::before { content: ""; background: #999; clip-path: polygon(0 8%, 36% 8%, 40% 20%, 100% 20%, 100% 92%, 0 92%); width: 16px; height: 16px; position: absolute; margin: 8px 8px; display: block; margin-left: -32px; } input[type="file"]:active::file-selector-button, input[type="file"]:focus::file-selector-button { width: 32px; height: 32px; margin-top: 0px; margin-left: -40px; } input[type="file"]::file-selector-button { border: none; text-indent: -100px; width: 0px; height: 0px; border-radius: 50%; position: absolute; margin-left: -24px; margin-top: 16px; background: rgba(0 0 0 / .12); transition: ease-in-out .2s; z-index: 1; display: block; padding: 0; } select:focus, textarea:focus, input:focus, select:active, textarea:active, input:active { border-color: var(--background-color); background-position: 0 100%; background-size: 100% 1px; } button { padding: 0px 12px; box-sizing: border-box; height: 32px; border: none; outline: none; background: var(--background-color); transition: ease-in-out .2s; border-radius: 2px; font-size: 0.9em; min-width: 56px; width: max-content; color: white; font-weight: bold; box-shadow: 2px 4px 16px -6px rgba(0 0 0 / .75); } button:disabled { background-color: #ddd; color: #666; box-shadow: 0px 5px 16px -8px !important; cursor: not-allowed; } button:hover { box-shadow: 2px 6px 16px -6px rgba(0 0 0 / .75); }';
const WIDGETS_STYLE_URL = URL.createObjectURL(new Blob([WIDGETS_STYLE]));

class AlertDialogElement extends HTMLElement {
    _title = document.createElement('h4');
    _message = document.createElement('div');
    _buttons = document.createElement('div');
    _dialog = document.createElement('div');
    _dialog_style = document.createElement('link');
    _widget_style = document.createElement('link');
    _overlay = document.createElement('div');
    _shadow;
    _eventListener = [];
    _modalDialog = false;
    status = AlertDialog.DIALOG_STATUS.DISMISSED;
    dialog;

    /**
     * 
     * @param {AlertDialog} dialog 
     */
    constructor(dialog) {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        this._shadow = shadow;

        this._dialog.classList.add('dialog');
        this._overlay.classList.add('overlay');
        this._title.classList.add('title');
        this._message.classList.add('message');
        this._buttons.classList.add('buttons');

        shadow.appendChild(this._dialog_style);
        shadow.appendChild(this._widget_style);
        shadow.appendChild(this._dialog);
        this._dialog.append(this._title);
        this._dialog.append(this._message);
        this._dialog.append(this._buttons);
        shadow.append(this._overlay);

        this._title.style.display = 'none';
        this._message.style.display = 'none';
        this._buttons.style.display = 'none';

        this._dialog_style.rel = 'stylesheet';
        this._dialog_style.href = ALERT_STYLE_URL;
        this._widget_style.rel = 'stylesheet';
        this._widget_style.href = WIDGETS_STYLE_URL;
        const dialogElement = this;
        this._addEventListener(this._overlay, 'click', function () {
            if (!dialogElement._modalDialog) {
                dialog.dismiss();
            };
        });

        this.classList.add('dismiss');
        this._overlay.classList.add('dismiss');
        this._dialog.classList.add('dismiss');
        this._dialog.style.transition = 'unset';
        this._overlay.style.transition = 'unset';
        this.dialog = dialog;
    };

    setTitle(title) {
        if (this.status === AlertDialog.DIALOG_STATUS.CLOSED) {
            throw (new Error('This dislog has been destoryed'));
        };
        this._title.style.display = '';
        this._title.textContent = title.replace(/\n/g, ' ');
    };

    setView(view) {
        if (this.status === AlertDialog.DIALOG_STATUS.CLOSED) {
            throw (new Error('This dislog has been destoryed'));
        };

        this._message.style.display = '';
        if (!this._message.shadowRoot) {
            this._message.attachShadow({ mode: 'open' });
        };
        const shadow = this._message.shadowRoot;
        shadow.innerHTML = '';
        if (typeof view === 'string') {
            shadow.innerHTML = view;
        } else if (view instanceof HTMLElement) {
            shadow.append(view);
        } else {
            throw (new Error('type error'));
        };
        shadow.append(this._widget_style.cloneNode(true));
    };

    _addEventListener(element, event, listener, options) {
        const listenerDetails = {
            element: element,
            type: event,
            listener: listener,
            options: options,
        };
        this._eventListener.push(listenerDetails);
        element.addEventListener(event, listener, options);
    };

    _setButton(text, className, listener) {
        this._buttons.style.display = '';
        const button = document.createElement('button');
        button.classList.add('button', className);
        button.textContent = text;
        this._buttons.append(button);
        const dialog = this.dialog;
        this._addEventListener(button, 'click', function (event) {
            if (typeof listener === 'function') {
                if (!listener.call(dialog, event)) {
                    dialog.close();
                };
            } else {
                dialog.close();
            };
        });
    };

    setPositiveButton(button, listener) {
        if (this.status === AlertDialog.DIALOG_STATUS.CLOSED) {
            throw (new Error('This dislog has been destoryed'));
        };
        this._setButton(button, 'positive-button', listener);
    };

    setNegativeButton(button, listener) {
        if (this.status === AlertDialog.DIALOG_STATUS.CLOSED) {
            throw (new Error('This dislog has been destoryed'));
        };
        this._setButton(button, 'negative-button', listener);
    };

    setNeturalButton(button, listener) {
        if (this.status === AlertDialog.DIALOG_STATUS.CLOSED) {
            throw (new Error('This dislog has been destoryed'));
        };
        this._setButton(button, 'netural-button', listener);
    };

    setModal(dismissOnClickOverlay) {
        if (this.status === AlertDialog.DIALOG_STATUS.CLOSED) {
            throw (new Error('This dislog has been destoryed'));
        };
        this._modalDialog = dismissOnClickOverlay;
    };

    _removeListener() {
        this._eventListener.forEach((listener, index) => {
            listener.element.removeEventListener(listener.type, listener.listener);
            this._eventListener[index] = null;
        });
    };

    close() {
        this.dismiss();
        const element = this;
        setTimeout(() => {
            this.status = AlertDialog.DIALOG_STATUS.CLOSING;
            this._removeListener();
            this.remove();
            this._title = null;
            this._message = null;
            this._buttons = null;
            this._dialog = null;
            this._style = null;
            this._overlay = null;
            this._shadow = null;
            this._eventListener = null;
            this._modalDialog = null;
            this.status = AlertDialog.DIALOG_STATUS.CLOSED;
        }, 200);
    };

    dismiss() {
        if (this.status === AlertDialog.DIALOG_STATUS.CLOSED) {
            throw (new Error('This dislog has been destoryed'));
        };

        this.status = AlertDialog.DIALOG_STATUS.DISMISSING;

        this._dialog.style.transition = '';
        this._overlay.style.transition = '';
        this.classList.add('dismiss');
        this._overlay.classList.add('dismiss');
        this._dialog.classList.add('dismiss');
        setTimeout(() => {
            if (this.status === AlertDialog.DIALOG_STATUS.DISMISSING) {
                this._dialog.style.transition = 'unset';
                this._overlay.style.transition = 'unset';
                this.remove();
                this.status = AlertDialog.DIALOG_STATUS.DISMISSED;
            };
        }, 200);
    };

    show() {
        if (this.status === AlertDialog.DIALOG_STATUS.CLOSED) {
            throw (new Error('This dislog has been destoryed'));
        };

        if (document.body.contains(this)) {
            throw (new Error('This dislog is already showed in window'));
        };

        this.status = AlertDialog.DIALOG_STATUS.OPENING;

        this._dialog.style.transition = 'unset';
        this._overlay.style.transition = 'unset';
        document.body.append(this);

        setTimeout(() => {
            if (this.status === AlertDialog.DIALOG_STATUS.OPENING) {
                this._dialog.style.transition = '';
                this._overlay.style.transition = '';
                this.classList.remove('dismiss');
                this._overlay.classList.remove('dismiss');
                this._dialog.classList.remove('dismiss');
                this.status = AlertDialog.DIALOG_STATUS.OPENED;
            };
        }, 100);
        return;
    };
};

customElements.define('alert-dialog', AlertDialogElement);

export class AlertDialog {
    #dialog_el;
    #onCloseCallback;
    #onShowCallback;
    #onDismissCallback;
    #destoryOnDismiss = true;

    static DIALOG_STATUS = {
        OPENING: 'opening',
        OPENED: 'opened',
        DISMISSING: 'dismissing',
        DISMISSED: 'dismissed',
        CLOSING: 'closing',
        CLOSED: 'closed',
    };

    constructor() {
        this.#dialog_el = new AlertDialogElement(this);
    };

    /**
     * set dialog dialog, `\n` will be replace to space
     * @param {string} title 
     * @returns {AlertDialog}
     */
    setTitle(title) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.setTitle(title);
        return this;
    };

    /**
     * set dialog message, use `\n` to wrap
     * @param {HTMLElement | string} view 
     * @param {(event?) => boolean} listener 
     * @returns {AlertDialog}
     */
    setMessage(message) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.setView(message.replace(/\n/g, '<br />'));
        return this;
    };

    /**
     * set dialog view, support HTMLElement and html format text
     * @param {HTMLElement | string} view 
     * @param {(event?) => boolean} listener 
     * @returns {AlertDialog}
     */
    setView(view) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.setView(view);
        return this;
    };

    getView() {
        return this.#dialog_el._message.shadowRoot;
    }

    /**
     * return `true` to prevent close dialog
     * @param {string} button 
     * @param {(event?) => boolean} listener 
     * @returns {AlertDialog}
     */
    setPositiveButton(button, listener) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.setPositiveButton(button, listener);
        return this;
    };

    /**
     * return `true` to prevent close dialog
     * @param {string} button 
     * @param {(event?) => boolean} listener 
     * @returns {AlertDialog}
     */
    setNegativeButton(button, listener) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.setNegativeButton(button, listener);
        return this;
    };

    /**
     * return `true` to prevent close dialog
     * @param {string} button 
     * @param {(event?) => boolean} listener 
     * @returns {AlertDialog}
     */
    setNeturalButton(button, listener) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.setNeturalButton(button, listener);
        return this;
    };

    /**
     * Set `true` to prevent closing dialog by touch overlay
     * @param {boolean} dissmissOnClickOverlay 
     * @returns {AlertDialog}
     */
    setModal(dismissOnClickOverlay) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.setModal(dismissOnClickOverlay);
        return this;
    };

    setDestoryOnDismiss(destoryOnDismiss = true) {
        this.#destoryOnDismiss = destoryOnDismiss;
        return this;
    }

    /**
     * 
     * @param {() => void} callback 
     * @returns {AlertDialog}
     */
    onShow(callback) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        if (typeof callback === 'function') {
            this.#onShowCallback = callback.bind(this);
        }
        return this;
    }

    /**
     * 
     * @param {() => void} callback 
     * @returns {AlertDialog}
     */
    onClose(callback) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        if (typeof callback === 'function') {
            this.#onCloseCallback = callback.bind(this);
        };
        return this;
    };

    /**
     * 
     * @param {() => void} callback 
     * @returns {AlertDialog}
     */
    onDismiss(callback) {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        if (typeof callback === 'function') {
            this.#onDismissCallback = callback.bind(this);
        };
        return this;
    };

    /**
     * Show dialog
     * @returns {AlertDialog}
     */
    show() {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.status = AlertDialog.DIALOG_STATUS.OPENING;
        if (typeof this.#onShowCallback === 'function') {
            this.#onShowCallback.call(this, this.#dialog_el._message.shadowRoot);
        };
        this.#dialog_el.show();
        return this;
    };

    /**
     * Close dialog
     * @returns {void}
     */
    close() {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.status = AlertDialog.DIALOG_STATUS.CLOSING;
        if (typeof this.#onCloseCallback === 'function') {
            this.#onCloseCallback(this.#dialog_el);
        };
        this.#dialog_el.close();

        this.#dialog_el = null;
        this.#onCloseCallback = null;
        this.#onShowCallback = null;
        this.#onDismissCallback = null;
    };

    /**
     * Close dialog
     * @returns {void}
     */
    dismiss() {
        if (this.#dialog_el === null) {
            throw (new Error('This dislog has been destoryed'));
        };
        this.#dialog_el.status = AlertDialog.DIALOG_STATUS.DISMISSING;
        if (typeof this.#onDismissCallback === 'function') {
            this.#onDismissCallback();
        };
        if (this.#destoryOnDismiss) {
            this.close();
        } else {
            this.#dialog_el?.dismiss();
        }
    }
    querySelectorAll(selector) {
        return this.#dialog_el._message.shadowRoot.querySelectorAll(selector);
    }
    querySelector(selector) {
        return this.#dialog_el._message.shadowRoot.querySelector(selector);
    }
}