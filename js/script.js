/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

import { StartProfile } from "./utils/data.js";
import { SearchEngineManager } from "./searchEngineManager.js";
import { CustomShortcutsCollection } from "./customShortcutsCollection.js";
import PagesIndicatorStatus from "./pagesIndicatorStatus.js";
import ShortcutFilter from "./utils/shortcutsFilter.js";
import SearchPanel from "./searchPanel.js";
import { Settings } from "./settings.js";
import { I18N } from "./utils/i18n.js";

I18N.setLang(navigator.language + 's');

const startProfile = new StartProfile();
const customShortcutsCollection = new CustomShortcutsCollection(document.querySelector('.shortcuts'));
const shortcutFilter = new ShortcutFilter(customShortcutsCollection);
const searchEngineManager = new SearchEngineManager(startProfile);
new SearchPanel(customShortcutsCollection, searchEngineManager, startProfile);

Settings.showWallapaer();

searchEngineManager.modifySearchEngine(startProfile.SearchEngine);

searchEngineManager.modifyActivatedSearchEngine();

function manageConfigs() {
    // new AlertDialog()
    //     .setTitle('设置')
    //     .setMessage('施工中，请等待后续更新')
    //     .setPositiveButton('确定')
    //     .setNegativeButton('关闭')
    //     .show()
    Settings.setWallpaper()
}


app.addEventListener('click', () => {
    searchEngineManager.showSearchEngineSelect(false);
});


const pagesIndicatorStatus = new PagesIndicatorStatus(customShortcutsCollection);

function expandShortcuts(expand = true) {
    const appRoot = document.querySelector('#app');
    customShortcutsCollection.removeTransition();
    if (expand) {
        shortcutFilter.show();
        setTimeout(() => {
            searchEngineManager.showSearchEngineSelect(false);
            appRoot.classList.add('expand');
        }, 50);
    } else {
        shortcutFilter.hide();
        appRoot.classList.remove('expand');
        pagesIndicatorStatus.hide();
    };
};

function stretchingShortcuts() {
    shortcutFilter.stretching();
    return customShortcutsCollection.stretching();
}

function expandMoreLinks() {
    let deltaY = 0;
    let timer = 0;
    let scroll_bottom = 0;
    let executing = false;
    const appRoot = document.querySelector('#app');
    const mouseWhellEvent = (y) => {
        deltaY += y;
        if (appRoot.classList.contains('expand')) {
            pagesIndicatorStatus.show();
        };
        if (executing) {
            setTimeout(() => {
                executing = false;
            }, 200);
            return;
        };
        let timeout = 0;
        clearTimeout(timer);
        clearTimeout(scroll_bottom);
        if (deltaY >= 200) {
            if (appRoot.classList.contains('expand')) {
                if (customShortcutsCollection.currentPage === customShortcutsCollection.pagesCount - 1) {
                    scroll_bottom = stretchingShortcuts();
                } else {
                    customShortcutsCollection.currentPage += 1;
                }
                timeout = 200;
            } else {
                expandShortcuts();
                timeout = 500
            };
            executing = true;
        } else if (deltaY <= -200) {
            if (appRoot.classList.contains('expand')) {
                if (customShortcutsCollection.currentPage === 0) {
                    expandShortcuts(false);
                    timeout = 500;
                } else {
                    customShortcutsCollection.currentPage -= 1;
                    timeout = 200;
                }
            }
            executing = true;
        };
        if (timeout > 0) {
            setTimeout(() => {
                executing = false;
            }, timeout);
        }
        timer = setTimeout(() => {
            deltaY = 0;
        }, 200);
    };
    appRoot.addEventListener('mousewheel', e => { mouseWhellEvent(e.deltaY) });
    appRoot.addEventListener('DOMMouseScroll', e => { mouseWhellEvent(e.detail * 50) });
};

document.addEventListener('keydown', e => {
    if (document.getElementById('app').classList.contains('expand')) {
        if (e.altKey && e.code === 'KeyS') {
            shortcutFilter.focus();
            e.preventDefault();
        }
    }
});

expandMoreLinks();
document.querySelector('.search-box input').focus();

document.querySelector('.settings .icon').addEventListener('click', manageConfigs);