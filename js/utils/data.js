/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

import { SEARCH_ENGINES, STATIC_SOURCE } from "../resource.js";

export class Shortcut {
    url;
    _parent
    elm;

    _name;
    _icon;
    _desc;
    get name() {
        return this._name;
    };
    set name(value) {
        this._name = value;
        this.elm.querySelector('.name').textContent = value;
    };
    get icon() {
        return this._icon;
    };
    set icon(value) {
        this._icon = value;
        this.elm.querySelector('img.icon').src = value;
    };
    get desc() {
        return this._desc;
    };
    set desc(value) {
        this._desc = value;
        if (this.parent) {
            this.elm.title = value;
        } else {
            this.elm.querySelector('.shortcut').title = value;
        }
    };

    set parent(parent) {
        this._parent = parent;
        this.elm = this.elm.querySelector('.shortcut');
        parent.append(this);
        this.setListener();
    };
    get parent() {
        return this._parent;
    };

    setClickEvent() {
        this.elm.addEventListener('mousedown', function (e) {
            if (e.target.closest('.action') ||
                e.target.classList.contains('indicator') ||
                e.target.classList.contains('add-shortcut')) {
                return;
            };
            if (e.buttons === 1) {
                location.assign(this.url);
            } else if (e.buttons === 4) {
                window.open(this.url);
            }
        }.bind(this));
    }

    setEditEvent() {
        this.elm.querySelector('.action>.edit').addEventListener('click', function (e) {
            this.edit();
            e.preventDefault();
            e.stopPropagation();
        }.bind(this));
    }

    setDeleteEvent() {
        this.elm.querySelector('.action>.delete').addEventListener('click', function (e) {
            this.remove();
            e.preventDefault();
            e.stopPropagation();
        }.bind(this), { once: true });
        this.elm._remove = this.elm.remove;
        this.elm.remove = this.remove.bind(this);
    }

    setDraggableEvent() {
        this.elm.querySelector('.indicator').addEventListener('mouseenter', function (e) {
            this.elm.setAttribute('draggable', true);
            this.elm.querySelector('.action').style.display = 'none';
            e.preventDefault();
            e.stopPropagation();
        }.bind(this));
        this.elm.querySelector('.indicator').addEventListener('mouseleave', function (e) {
            this.elm.removeAttribute('draggable');
            this.elm.querySelector('.action').style.display = '';
            e.preventDefault();
            e.stopPropagation();
        }.bind(this));
    }

    setDragEvent() {
        const dragImg = new Image(48, 48);
        dragImg.style.objectFit = 'contain';
        const dragIcon = document.createElement('canvas');
        dragIcon.height = 48;
        dragIcon.width = 48;
        const ctx = dragIcon.getContext('2d');
        dragImg.onload = () => {
            ctx.drawImage(dragImg, 0, 0, 48, 48);
        };
        dragImg.src = this._icon;

        this.elm.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/uri-list', this.url);
            e.dataTransfer.setData('text/plain', `${this._name} ${this.url}`);
            dragIcon.style.top = '100%';
            document.body.append(dragIcon)
            dragIcon.style.position = 'fixed';
            e.dataTransfer.setDragImage(dragIcon, 0, 0);
            setTimeout(() => {
                this.elm.classList.add('dragging');
                dragIcon.remove();
            }, 50);
            e.dataTransfer.effectAllowed = 'all';
        }.bind(this));
        this.elm.addEventListener('dragend', function () {
            this.elm.classList.remove('dragging');
        }.bind(this));
    }

    setListener() {
        this.setClickEvent();
        this.setDeleteEvent();
        this.setEditEvent();
        this.setDraggableEvent();
        this.setDragEvent();
    }

    constructor(name, url, icon, desc = '', parent) {
        this.elm = document.querySelector('.shortcuts template').content.cloneNode(true);
        this.name = name;
        this.url = url;
        const icon_ = icon ? icon : new URL(url).origin + '/favicon.ico';
        this.icon = icon_;
        this.desc = desc;
        if (parent) {
            this.parent = parent;
        };
        this.elm.data = this;
    }

    bind(collection) {
        this.parent = collection;
    }

    open() {
        if (this.url) {
            location.assign(this.url);
        }
    }

    remove() {
        if (this.parent) {
            for (let i = 0; i < this.parent.size(); i++) {
                if (this.parent.at(i) === this) {
                    this.parent.remove(i);
                    break;
                }
            }
            this.elm._remove();
        }
    }

    edit() {
        if (this.parent) {
            for (let i = 0; i < this.parent.size(); i++) {
                if (this.parent.at(i) === this) {
                    this.parent.edit(i);
                    break;
                }
            }
        }
    }
}

export class ShortcutCollections {
    _shortcutCollections = [];
    _elm;
    _add_elm;
    constructor(elm) {
        this._elm = elm;
        this._add_elm = elm.querySelector('.add-shortcut')
    };

    add(link) {
        new Shortcut(link.name, link.url, link.icon, link.desc, this);
    };
    append(link) {
        this._add_elm.before(link.elm);
        this._shortcutCollections.push(link)
    };
    at(index) {
        return this._shortcutCollections[index];
    };
    size() {
        return this._shortcutCollections.length;
    };
    remove(id) {
        return this._shortcutCollections.splice(id, 1);
    }
}

export class StartProfile {
    static INNER_DIV = 64;
    BLANK_IMAGE;
    INNER_SEARCH_ENGINES = SEARCH_ENGINES;
    CustomSearchEngine = [];
    getSearchEngine(id = this.SearchEngine) {
        if (id < StartProfile.INNER_DIV) {
            return this.INNER_SEARCH_ENGINES[id];
        } else {
            return this.CustomSearchEngine[id - StartProfile.INNER_DIV];
        }
    }
    getEngineIcon(id = this.SearchEngine) {
        const engine = this.getSearchEngine(id);
        if (id < StartProfile.INNER_DIV) {
            return STATIC_SOURCE[engine.icon];
        } else {
            return engine?.icon;
        }
    }
    getEngineLogo(id = this.SearchEngine) {
        const engine = this.getSearchEngine(id);
        if (id < StartProfile.INNER_DIV) {
            return STATIC_SOURCE[engine.logo];
        } else {
            return engine.logo === '' ? this.BLANK_IMAGE : engine.logo;
        }
    }

    _SearchEngine = 0;
    _DefaultEngine = this._SearchEngine;
    get DefaultEngine() {
        return this._DefaultEngine;
    }
    get SearchEngine() {
        return this._SearchEngine;
    };
    set SearchEngine(engine_id) {
        if (isNaN(engine_id) | !this.getSearchEngine(engine_id)) {
            engine_id = 0;
        }
        this._SearchEngine = engine_id;
    };
    modifyDefaultEngine(engine_id) {
        this.SearchEngine = engine_id;
        this._DefaultEngine = this.SearchEngine;
        localStorage.SearchEngine = engine_id;
    };

    DisabledSearchEngine = [];
    saveDisanledSearchEngine() {
        localStorage.DisabledSearchEngine = JSON.stringify(this.DisabledSearchEngine);
    };
    disableInnerEngine(id) {
        id = parseInt(id);
        if (this.DisabledSearchEngine.includes(id)) {
            return
        }
        if (id >= StartProfile.INNER_DIV) {
            console.log(id)
            throw new Error('id is not inner search engine')
        }
        if (id >= this.INNER_SEARCH_ENGINES.length) {
            console.log(id)
            throw new Error('engine not exsist')
        }
        if (id === this.SearchEngine) {
            throw new Error('engine is default engine')
        }
        this.DisabledSearchEngine.push(id);
        this.saveDisanledSearchEngine();
    };
    enableInnerEngine(id) {
        const loc = this.DisabledSearchEngine.indexOf(id);
        if (loc >= 0 && id < this.INNER_SEARCH_ENGINES.length) {
            this.DisabledSearchEngine.splice(loc, 1);
            this.saveDisanledSearchEngine();
        }
    }
    eachEngine(callback, showDisabled = true) {
        this.INNER_SEARCH_ENGINES.forEach((e, i) => {
            if (!showDisabled && this.DisabledSearchEngine.includes(i)) {
                return;
            }
            callback(e, i);
        });
        this.CustomSearchEngine.forEach((e, i) => {
            callback(e, i + StartProfile.INNER_DIV);
        });
    };
    saveCustomSearchEngine() {
        localStorage.CustomSearchEngine = JSON.stringify(this.CustomSearchEngine);
    }
    addCustomSearchEngine(engine) {
        if (engine.name && engine.url && engine.index) {
            this.CustomSearchEngine.push(engine);
            this.saveCustomSearchEngine();
            return this.CustomSearchEngine.length - 1 + StartProfile.INNER_DIV;
        };
        return null;
    };
    removeCustomSearchEngine(id) {
        if (id >= StartProfile.INNER_DIV) {
            this.CustomSearchEngine.splice(id - StartProfile.INNER_DIV, 1);
            this.saveCustomSearchEngine();
        } else {
            throw new Error('inner search engine is not allowed to remove, please use disable instead');
        }
    }
    getDisabledCount() {
        return this.DisabledSearchEngine.length;
    };
    getEngineCount() {
        return this.INNER_SEARCH_ENGINES.length + this.CustomSearchEngine.length;
    };

    ShortcutLinks = [];
    constructor() {
        const cav = document.createElement('canvas');
        cav.width = 1;
        cav.height = 1;

        this.BLANK_IMAGE = cav.toDataURL();

        if (localStorage.DisabledSearchEngine !== undefined) {
            try {
                this.DisabledSearchEngine = JSON.parse(localStorage.DisabledSearchEngine);
            } catch {
                this.DisabledSearchEngine = [];
                this.saveDisanledSearchEngine();
            }
        } else {
            this.DisabledSearchEngine = [];
            this.saveDisanledSearchEngine();
        }
        if (localStorage.CustomSearchEngine !== undefined) {
            try {
                this.CustomSearchEngine = JSON.parse(localStorage.CustomSearchEngine);
            } catch {
                this.CustomSearchEngine = [];
            }
        } else {
            this.CustomSearchEngine = [];
        }
        this.INNER_SEARCH_ENGINES.forEach((e, i) => {
            const profiler = this;
            Object.defineProperty(e, 'disabled', {
                get() {
                    return profiler.DisabledSearchEngine.includes(i);
                }
            })
        });
        if (localStorage.SearchEngine !== undefined) {
            try {
                this.SearchEngine = parseInt(localStorage.SearchEngine);
            } catch {
                this.modifyDefaultEngine(0);
            }
        } else {
            this.modifyDefaultEngine(0);
        }
        this._DefaultEngine = this.SearchEngine;
    }
}

export class SearchHistory {
    static MAX_VISIBLE_HISTORY = 8;
    searchHistory = [];
    constructor() {
        this.loadHistory();
    }
    loadHistory() {
        if (localStorage.SearchHistory !== undefined) {
            try {
                this.searchHistory = JSON.parse(localStorage.SearchHistory);
            } catch {
                this.saveHistory();
            }
        } else {
            this.saveHistory();
        }
    }
    saveHistory() {
        localStorage.SearchHistory = JSON.stringify(this.searchHistory);
    }
    recordHistory(record) {
        let includes = false;
        for (let i = 0; i < this.searchHistory.length; i++) {
            const history = this.searchHistory[i];
            if (history.key === record) {
                includes = true;
                break
            }
        }
        if (!includes) {
            this.searchHistory.push({
                key: record,
                time: new Date().getTime()
            });
            this.saveHistory();
        }
    }
    filterHistory(key) {
        return this.searchHistory.filter(val => {
            return val.key.match(key) !== null;
        });
    }
    deleteHistory(key) {
        for (let i = this.searchHistory.length - 1; i >= 0; i--) {
            const record = this.searchHistory[i];
            if (record.key === key) {
                this.searchHistory.splice(i, 1);
            }
        }
    }
    clearHistory() {
        this.searchHistory = [];
        this.saveHistory();
    }
    forEach(callback) {
        if (typeof callback !== 'function') {
            return
        }
        for (let i = 0; i < this.searchHistory.length && i < SearchHistory.MAX_VISIBLE_HISTORY; i++) {
            callback(this.searchHistory[i], i);
        }
    }
}