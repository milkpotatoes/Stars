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
    setNeturalButton(button: string, listener: (event?: MouseEvent) => boolean): AlertDialog;

    /**
     * Set `true` to prevent closing dialog by touch overlay
     * @param {boolean} dissmissOnClickOverlay 
     * @returns {AlertDialog}
     */
    setModal(dismissOnClickOverlay: boolean): AlertDialog;

    /**
     * set destory this AlertDialog after it dissmised or not
     * @param {boolean} destoryOnDismiss 
     */
    setDestoryOnDismiss(destoryOnDismiss: boolean): AlertDialog;

    /**
     * this callback will exectued when the dialog is opening;
     * @param {() => void} callback 
     * @returns {AlertDialog}
     */
    onShow(callback: () => void): AlertDialog;

    /**
     * this callback will exectued when the dialog is closing;
     * @param {() => void} callback 
     * @returns {AlertDialog} 
     */
    onClose(callback: () => void): AlertDialog;

    /**
     * this callback will exectued when the dialog is dismissing;
     * @param {() => void} callback 
     * @returns {AlertDialog}
     */
    onDismiss(callback: () => void): AlertDialog;

    /**
     * Show dialog, or reopen dialog;
     * @returns {AlertDialog}
     */
    show(): void;

    /**
     * Close dialog, it will destory this dialog;
     * @returns {void}
     */
    close(): void;

    /**
     * hide dialog, you can reopen it by `AlertDialog.open()`,
     * if DestoryOnDimiss is disabled.
     * @returns {void}
     */
    dismiss(): void;
    querySelectorAll(selector: string): HTMLElement[] | null;
    querySelector(selector: string): HTMLElement | null;

}