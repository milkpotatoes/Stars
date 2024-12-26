/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT License
 */

export class AlertDialog {
    static DIALOG_STATUS = {
        OPENING: 'opening',
        OPENED: 'opened',
        DISMISSING: 'dismissing',
        DISMISSED: 'dismissed',
        CLOSING: 'closing',
        CLOSED: 'closed',
    };

    /**
     * set dialog dialog, `\n` will be replace to space
     * @param {string} title 
     * @returns {AlertDialog}
     */
    setTitle(title: string): AlertDialog;

    /**
     * set dialog message, use `\n` to wrap
     * @param {string} message 
     * @returns {AlertDialog}
     */
    setMessage(message: string): AlertDialog;

    /**
     * set dialog view, support HTMLElement and html format text
     * @param {HTMLElement | string} view 
     * @returns {AlertDialog}
     */
    setView(view: HTMLElement | string): AlertDialog;

    getView(): ShadowRoot;

    /**
     * return `true` to prevent close dialog
     * @param {string} button 
     * @param {(event?: MouseEvent) => boolean} listener 
     * @returns {AlertDialog}
     */
    setPositiveButton(button: string, listener: (event?: MouseEvent) => boolean): AlertDialog;

    /**
     * return `true` to prevent close dialog
     * @param {string} button 
     * @param {(event?: MouseEvent) => boolean} listener 
     * @returns {AlertDialog}
     */
    setNegativeButton(button: string, listener: (event?: MouseEvent) => boolean): AlertDialog;

    /**
     * return `true` to prevent close dialog
     * @param {string} button 
     * @param {(event?: MouseEvent) => boolean} listener 
     * @returns {AlertDialog}
     */
    setNeutralButton(button: string, listener: (event?: MouseEvent) => boolean): AlertDialog;

    /**
     * Set `true` to prevent closing dialog by touch overlay
     * @param {boolean} dismissOnClickOverlay 
     * @returns {AlertDialog}
     */
    setModal(dismissOnClickOverlay: boolean): AlertDialog;

    /**
     * set destroy this AlertDialog after it dismissed or not
     * @param {boolean} destroyOnDismiss 
     */
    setDestroyOnDismiss(destroyOnDismiss: boolean): AlertDialog;

    /**
     * this callback will executed when the dialog is opening;
     * @param {(messageView: HTMLElement) => void} callback 
     * @returns {AlertDialog}
     */
    onShow(callback: (messageView: HTMLElement) => void): AlertDialog;

    /**
     * this callback will executed when the dialog is closing;
     * @param {() => void} callback 
     * @returns {AlertDialog} 
     */
    onClose(callback: () => void): AlertDialog;

    /**
     * this callback will executed when the dialog is dismissing;
     * @param {() => void} callback 
     * @returns {AlertDialog}
     */
    onDismiss(callback: () => void): AlertDialog;

    /**
     * Show dialog, or reopen dialog;
     * @returns {AlertDialog}
     */
    show(): AlertDialog;

    /**
     * Close dialog, it will destroy this dialog;
     * @returns {void}
     */
    close(): void;

    /**
     * hide dialog, you can reopen it by `AlertDialog.open()`,
     * if DestroyOnDismiss is disabled.
     * @returns {void}
     */
    dismiss(): void;
    querySelectorAll(selector: string): HTMLElement[] | null;
    querySelector(selector: string): HTMLElement | null;

}