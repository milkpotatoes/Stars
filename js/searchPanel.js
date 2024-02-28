/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

import { CustomShortcutsCollection } from "./customShortcutsCollection.js";
import { SearchHistory, StartProfile } from "./utils/data.js";

const SEARCH_ENGINE_LOGO = document.querySelector('.search-logo');
const SEARCH_ENGINE_SELECT = document.querySelector('.search-select');
const SEARCH_BUTTON = document.querySelector('.search-button');
const SEARCH_INPUT = document.querySelector('#search-key');
const SEARCH_ENGINE = document.querySelector('.search-icon');

class NormalPanel {
    elem;
    input;
    _focus = -1;
    get focus() {
        if (!this.activated) {
            this._focus = -1;
        }
        return this._focus;
    }
    set focus(item) {
        if (this.activated) {
            this._focus = Math.min(this.getItems() - 1, Math.max(-1, item));
        } else {
            this._focus = -1;
        }
    }
    activated = false;
    searchPanel = null;

    constructor(input) {
        this.input = input;
    }
    registerSearchPanel(searchPanel) {
        this.searchPanel = searchPanel;
    }
    hide() {
        this.elem.classList.add('hidden');
        this.activated = false;
    }
    show() {
        this.focus = -1;
        this.focusAt(-1);
        this.elem.classList.remove('hidden');
        this.activated = true;
    }
    getItems() {
        return this.elem.children.length;
    }
    focusAt(id = this.focus) {
        this.elem.querySelector('.focus')?.classList.remove('focus');
        this.focus = id;
        if (id > -1) {
            this.elem.children[id].classList.add('focus');
        }
    }
    focusNext() {
        this.focus++;
        this.focusAt();
    }
    focusPrev() {
        this.focus--;
        this.focusAt();
    }
    applyChoice(item) {
        if (!this.activated) {
            return;
        }
        if (item) {
            this.input.value = item.getAttribute('data');
            if (this.searchPanel !== null) {
                this.searchPanel.smartSearchBar(this.input.value);
            }
        } else if (this.focus >= 0) {
            this.input.value = this.elem.children[this.focus].getAttribute('data');
        }
        this.searchPanel.smartSearchBar(this.input.value);
    }
    setEventListener() {
        this.elem.addEventListener('mousedown', (e) => {
            e.preventDefault();
            let focusId = 0;
            const item = e.target.tagName === "DIV" ? e.target : e.target.closest('div');
            for (; focusId < this.elem.children.length; focusId++) {
                if (item === this.elem.children[focusId]) {
                    break;
                }
            }
            this.focusAt(focusId);
            this.applyChoice(item);
        });
    }
}

class HelpPanel extends NormalPanel {
    constructor(input) {
        super(input);
        this.elem = document.querySelector('.search-box .search-help');
        this.setEventListener();
    }
}

class CommandPanel extends NormalPanel {
    profiler;
    manager;
    lastFocusStatus = [0, this.focus];
    /**
     * 
     * @param {HTMLInputElement} input 
     * @param {StartProfile} profiler
     */
    constructor(input, profiler, manager) {
        super(input);
        this.elem = document.querySelector('.search-box .search-command');
        this.setEventListener();
        this.profiler = profiler;
        this.manager = manager;
    }
    show(options = null) {
        super.show();
        this.updateCommand(options);
    }
    hide() {
        super.hide();
        this.manager.useSearchEngine(this.profiler.DefaultEngine);
    }
    updateCommand(options = null) {
        if (options === null) {
            this.hide();
            return;
        }
        this.elem.innerHTML = '';
        const dirSearch = document.createElement('div');
        dirSearch.setAttribute('data', this.input.value);
        dirSearch.setAttribute('engine-id', this.profiler.DefaultEngine);
        dirSearch.innerHTML = `<i>使用</i><span>默认搜索引擎</span><i>搜索</i> <i>${this.input.value}</i>`;
        this.elem.append(dirSearch);
        this.profiler.eachEngine((item, id) => {
            const url = new URL(item.url);
            const div = document.createElement('div');
            const searchKey = item.name + url.host +
                new URL(item.index).host;
            if (searchKey.match(options.key ?? '') === null &&
                (isNaN(parseInt(options.key ?? '')) ||
                    !(id === parseInt(options.key ?? '')))) {
                return
            }
            let name = url.hostname.match(/^[\s\S]+\.(\w+)\.\w+$/) ?? url.hostname.match(/^(\w+)\.\w+$/);
            if (name !== null) {
                name = name[1];
            } else {
                name = url.hostname;
            }
            div.setAttribute('data', `/${name} ${options?.query ?? ''}`);
            div.setAttribute('engine-id', id);
            div.innerHTML = `<i>使用</i><span>${item.name}</span><i>搜索</i> <i>${options?.query ?? ''}</i>`;
            this.elem.append(div);
        }, false);
        if (this.elem.children.length > 1) {
            this.activated = true;
        } else {
            this.hide();
            return;
        }

        if (this.lastFocusStatus[0] === this.elem.children.length) {
            if (this.lastFocusStatus[1] > -1) {
                this.focus = this.lastFocusStatus[1];
                this.focusAt(this.focus, false);
            } else {
                this.lastFocusStatus[1] = this.focus;
            }
        } else {
            this.lastFocusStatus[0] = this.elem.children.length;
            this.lastFocusStatus[1] = -1;
            if (options.key && options.key !== '') {
                this.lastFocusStatus[1] = this.activated ? 1 : 0;
                this.focusAt(this.lastFocusStatus[1], false);
            }
        }
    }
    focusAt(id = this.focus, updateInput = true) {
        super.focusAt(id);
        if (id > -1) {
            const item = this.elem.children[id];
            if (updateInput) {
                this.input.value = item.getAttribute('data');
            }
            this.manager.useSearchEngine(parseInt(item.getAttribute('engine-id')));
            this.lastFocusStatus[1] = id;
        } else {
            this.manager.useSearchEngine(this.profiler.DefaultEngine);
        }
    }
    setEventListener() {
        this.elem.addEventListener('mousedown', (e) => {
            e.preventDefault();
            let focusId = 0;
            const item = e.target.tagName === "DIV" ? e.target : e.target.closest('div');
            for (; focusId < this.elem.children.length; focusId++) {
                if (item === this.elem.children[focusId]) {
                    break;
                }
            }
            this.focus = focusId;
            this.applyChoice(item);
            if (focusId === 0) {
                this.focus = focusId;
                SEARCH_BUTTON.click();
            } else if (this.searchPanel.checkSearchMode(this.input.value).query && this.focus > 0) {
                SEARCH_BUTTON.click();
            }
        });
    }
}

class HistoryPanel extends NormalPanel {
    history = new SearchHistory();
    originKey = '';
    constructor(input) {
        super(input);
        this.elem = document.querySelector('.search-box .search-history');
        this.setEventListener();
    }
    show(options = null) {
        super.show();
        this.updateCommand(options);
    }
    focusAt(id = this.focus) {
        super.focusAt(id);
        this.input.value = this.elem.children[id]?.getAttribute('data') ??
            this.input.value;
    }
    focusPrev() {
        if (this.focus === 0) {
            this.input.value = this.originKey;
        }
        super.focusPrev()
    }
    updateCommand(options = null) {
        if (options === null) {
            this.hide();
            return;
        }
        this.elem.innerHTML = '';
        this.originKey = options.key;
        if (options.key === '#') {
            this.history.forEach(history => {
                const div = document.createElement('div');
                div.setAttribute('data', history.key);
                div.innerHTML = `${history.key}<span class="delete material-icon"></span>`;
                this.elem.append(div);
            });
        } else {
            const matchedHistory = this.history.filterHistory(options.key);
            for (let i = 0; i < matchedHistory.length && i < SearchHistory.MAX_VISIBLE_HISTORY; i++) {
                const history = matchedHistory[i];
                const div = document.createElement('div');
                div.setAttribute('data', history.key);
                div.innerHTML = `${history.key}<span class="delete material-icon"></span>`;
                this.elem.append(div);
            }
        }
        if (this.elem.children.length > 1 || options.key === '' || options.key === '#') {
            this.activated = true;
        }
    }
    deleteHistory(id = this.focus) {
        if (id >= 0) {
            this.history.deleteHistory(this.elem.children[id].getAttribute('data'));
        }
        this.updateCommand(this.searchPanel.checkSearchMode(this.originKey));
    }
    addHistory(key) {
        this.history.recordHistory(key);
    }
    setEventListener() {
        this.elem.addEventListener('mousedown', (e) => {
            e.preventDefault();
            let focusId = 0;
            const item = e.target.tagName === "DIV" ? e.target : e.target.closest('div');
            for (; focusId < this.elem.children.length; focusId++) {
                if (item === this.elem.children[focusId]) {
                    break;
                }
            }
            if (e.target.classList.contains('delete')) {
                this.deleteHistory(focusId);
            } else {
                this.focusAt(focusId);
                this.applyChoice(item);
            }
        });
    }
}

export default class SearchPanel {
    static SEARCH_MODE = {
        HELP: 0,
        DEFAULT: 1,
        HISTORY: 2,
        FILTER: 3,
        CUSTOM: 4,
    }

    collection;
    manager;
    profiler;
    panels;
    searchMode = SearchPanel.SEARCH_MODE.DEFAULT;
    /**
     * 
     * @param {CustomShortcutsCollection} collection 
     * @param {SearchPanel} manager 
     * @param {StartProfile} profiler 
     */
    constructor(collection, manager, profiler) {
        this.collection = collection;
        this.manager = manager;
        this.profiler = profiler;
        this.setEventListener();

        this.panels = {
            HELP_PANEL: new HelpPanel(SEARCH_INPUT),
            COMMAND_PANEL: new CommandPanel(SEARCH_INPUT, profiler, manager),
            HISTORY_PANEL: new HistoryPanel(SEARCH_INPUT),
        }
        for (let k in this.panels) {
            this.panels[k].registerSearchPanel(this);
        }
    }

    checkSearchMode(key) {
        const filterKey = key.match(/^@links (.+)?$/);
        if (filterKey !== null) {
            return {
                mode: SearchPanel.SEARCH_MODE.FILTER,
                key: filterKey[1] ? filterKey[1] : ''
            };
        }
        const searchKey = key.match(/^\/(\w+) ?(.+)?$/);
        if (searchKey !== null) {
            return {
                mode: SearchPanel.SEARCH_MODE.CUSTOM,
                key: searchKey[1] ?? '',
                query: searchKey[2] ?? '',
            };
        }
        if (key === '/') {
            return {
                mode: SearchPanel.SEARCH_MODE.CUSTOM,
                key: null,
                query: null,
            };
        }
        if (key === '?' || '@link'.indexOf(key) === 0 && key !== '') {
            return {
                mode: SearchPanel.SEARCH_MODE.HELP,
            };
        };

        if (key === '') {
            return {
                mode: SearchPanel.SEARCH_MODE.DEFAULT,
            };
        };

        if (key === '#') {
            return {
                mode: SearchPanel.SEARCH_MODE.HISTORY,
                key: SEARCH_INPUT.value,
            };
        };
        return {
            mode: SearchPanel.SEARCH_MODE.HISTORY,
            key: SEARCH_INPUT.value,
        };
    }

    showSearchPanel(options) {
        if (this.searchMode === SearchPanel.SEARCH_MODE.HELP) {
            this.panels.HELP_PANEL.show();
            this.panels.HISTORY_PANEL.hide();
            this.panels.COMMAND_PANEL.hide();
        } else if (this.searchMode === SearchPanel.SEARCH_MODE.HISTORY) {
            this.panels.HELP_PANEL.hide();
            this.panels.HISTORY_PANEL.show(options);
            this.panels.COMMAND_PANEL.hide();
        } else if (this.searchMode === SearchPanel.SEARCH_MODE.CUSTOM) {
            this.panels.HELP_PANEL.hide();
            this.panels.HISTORY_PANEL.hide();
            this.panels.COMMAND_PANEL.show(options);
        } else if (this.searchMode === SearchPanel.SEARCH_MODE.FILTER ||
            this.searchMode === SearchPanel.SEARCH_MODE.DEFAULT) {
            this.panels.HELP_PANEL.hide();
            this.panels.HISTORY_PANEL.hide();
            this.panels.COMMAND_PANEL.hide();

        }
    }

    smartSearchBar(key) {
        const searchOption = this.checkSearchMode(key);
        this.searchMode = searchOption.mode;
        this.showSearchPanel(searchOption);
        if (searchOption.mode === SearchPanel.SEARCH_MODE.FILTER) {
            this.collection.filter(searchOption.key);
        }
    }

    setEventListener() {
        SEARCH_ENGINE_LOGO.addEventListener('click', () => {
            const engine = this.profiler.getSearchEngine();
            window.open(engine.index, '_top');
        });

        SEARCH_ENGINE_SELECT.addEventListener('click', e => {
            const engine_id = e.target.closest('div').data;
            if (engine_id === undefined) {
                this.manager.manageSearchEngines();
                this.manager.showSearchEngineSelect(false);
                return;
            }
            if (this.profiler.SearchEngine !== engine_id) {
                this.manager.showSearchEngineSelect(engine_id);
                SEARCH_ENGINE_SELECT.querySelector('.selected')?.classList.remove('selected');
                e.target.closest('div').classList.add('selected');
                this.manager.modifySearchEngine(engine_id);
                setTimeout(() => {
                    this.manager.showSearchEngineSelect(false);
                }, 250);
            } else {
                this.manager.showSearchEngineSelect(false);
            }
            e.stopPropagation();
        });

        SEARCH_BUTTON.addEventListener('click', e => {
            e.preventDefault();
            const searchKey = (this.panels.COMMAND_PANEL.activated
                && this.panels.COMMAND_PANEL.focus > 0) ?
                this.checkSearchMode(SEARCH_INPUT.value).query :
                SEARCH_INPUT.value;
            if (searchKey !== '') {
                const engine = this.profiler.getSearchEngine();
                const url = engine.url.replace(/%s/,
                    encodeURIComponent(searchKey));
                this.panels.HISTORY_PANEL.addHistory(searchKey);
                window.open(url, '_top');
            };
        });

        SEARCH_INPUT.addEventListener('focus', e => {
            this.smartSearchBar(e.target.value);
        });

        SEARCH_INPUT.addEventListener('blur', e => {
            this.searchMode = SearchPanel.SEARCH_MODE.DEFAULT;
            this.showSearchPanel();
            this.collection.filter('');
        });

        SEARCH_INPUT.addEventListener('input', e => {
            this.smartSearchBar(e.target.value);
        });

        SEARCH_INPUT.addEventListener('keydown', e => {
            const panels = this.panels;
            if (e.key === 'Tab') {
                e.preventDefault();
                for (let key in panels) {
                    panels[key].applyChoice();
                }
                this.smartSearchBar(e.target.value);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                for (let key in panels) {
                    panels[key].focusPrev();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                for (let key in panels) {
                    panels[key].focusNext();
                }
            } else if (e.key === 'Delete' && panels.HISTORY_PANEL.activated) {
                e.preventDefault();
                panels.HISTORY_PANEL.deleteHistory()
            }
        });

        SEARCH_ENGINE.addEventListener('click', e => {
            this.manager.showSearchEngineSelect(this.profiler.SearchEngine);
            e.stopPropagation();
        });
    }
}