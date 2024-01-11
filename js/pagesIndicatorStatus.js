const SHORTCUTS_COLLECTION_CONTAINER = document.querySelector('.shortcuts');

export default class PagesIndicatorStatus {
    pagesIndicator = document.querySelector('.pages-indicator');
    hideTimer = 0;
    customShortcutsCollection;
    constructor(customShortcutsCollection) {
        this.customShortcutsCollection = customShortcutsCollection;
        const indicator = this;
        this.hide();
        this.pagesIndicator.addEventListener('mouseenter', () => {
            indicator.show();
        });
        const launcherRight = SHORTCUTS_COLLECTION_CONTAINER.getClientRects()[0].right;
        const selfX = this.pagesIndicator.getClientRects()[0].left;
        if (selfX >= launcherRight) {
            this.pagesIndicator.style.margin = '-24px';
        };
    };
    autoHide() {
        const indicator = this;
        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            indicator.hide();
        }, 3000);
    };
    show() {
        this.pagesIndicator.style.filter = 'opacity(1)';
        this.autoHide();
        if (this.customShortcutsCollection.pagesCount === 1) {
            this.forceHide();
        } else {
            this.forceHide(false);
        }
    };
    forceHide(hide = true) {
        if (hide) {
            this.pagesIndicator.style.display = 'none';
        } else {
            this.pagesIndicator.style.display = '';
        }
    }
    hide() {
        clearTimeout(this.hideTimer)
        this.pagesIndicator.style.filter = 'opacity(0)';
    };
};