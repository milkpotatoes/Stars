/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

import { CustomShortcutsCollection } from "../customShortcutsCollection.js";

export default class ShortcutFilter {
    elem = document.querySelector('.shortcut-filter');
    collection;
    input = this.elem.querySelector('input');
    /**
     * 
     * @param {CustomShortcutsCollection} collection 
     */
    constructor(collection) {
        this.collection = collection;
        this.input.addEventListener('input', e => {
            this.filter(e.target.value);
        });
    }
    focus() {
        this.input.focus();
    }
    stretching() {
        this.elem.style.transition = 'ease-in-out .2s';
        this.elem.style.transform = 'translate(0, -20px)';
        setTimeout(() => {
            this.elem.style.transform = '';
            setTimeout(() => {
                this.elem.style.transition = '';
            }, 200);
        }, 200);
    }
    show() {
        this.input.value = '';
        this.elem.style.transition = '';
        this.filter('');
    }
    hide() {
        this.input.blur();
        this.input.value = '';
        this.filter('');
    }
    filter(key = '') {
        this.collection.filter(key);
        this.collection.refreshPageIndicator();
    }
}