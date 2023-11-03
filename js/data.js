import { SEARCH_ENGINES, STATIC_SOURCE } from "./resource.js";

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
        this.elm.querySelector('.icon').style.backgroundImage = `url(${value})`;
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
        this.elm.addEventListener('click', function () {
            location.assign(this.url);
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
        this.elm.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/uri-list', this.url);
            e.dataTransfer.setData('text/plain', `${this._name} ${this.url}`);
            setTimeout(() => {
                this.elm.classList.add('dragging');
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
            return engine.logo;
        }
    }

    _SearchEngine = 0;
    get SearchEngine() {
        return this._SearchEngine;
    };
    set SearchEngine(engine_id) {
        if (isNaN(engine_id) | !this.getSearchEngine(engine_id)) {
            engine_id = 0;
        }
        localStorage.SearchEngine = engine_id;
        this._SearchEngine = engine_id;
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
        const loc = this.DisabledSearchEngine.includes(id)
        if (loc >= 0 && id < this.INNER_SEARCH_ENGINES.length) {
            this.DisabledSearchEngine.splice(loc, 1);
            this.saveDisanledSearchEngine();
        }
    }
    eachEngine(callback) {
        this.INNER_SEARCH_ENGINES.forEach((e, i) => {
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
            saveCustomSearchEngine()
            return this.CustomSearchEngine.length - 1 + StartProfile.INNER_DIV;
        };
    };
    removeCustomSearchEngine(id) {
        if (id >= StartProfile.INNER_DIV) {
            this.CustomSearchEngine.splice(id - StartProfile.INNER_DIV, 1);
            saveCustomSearchEngine()
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
                this.SearchEngine = 0;
            }
        } else {
            this.SearchEngine = 0;
        }
    }
}