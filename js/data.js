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
        this.elm.addEventListener('click', function () {
            location.assign(this.url);
        }.bind(this));
        this.elm._remove = this.elm.remove;
        this.elm.remove = this.remove.bind(this);
        this.elm.querySelector('.action>.delete').addEventListener('click', function (e) {
            this.remove();
            e.preventDefault();
            e.stopPropagation();
        }.bind(this), { once: true });
        this.elm.querySelector('.action>.edit').addEventListener('click', function (e) {
            this.edit();
            e.preventDefault();
            e.stopPropagation();
        }.bind(this), { once: true });
    };
    get parent() {
        return this._parent;
    };

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
    _SearchEngine = 0;

    get SearchEngine() {
        return this._SearchEngine;
    }
    set SearchEngine(engine_id) {
        localStorage.SearchEngine = engine_id;
        this._SearchEngine = engine_id;
    }
    ShortcutLinks = [];
    constructor() {
        if (localStorage.SearchEngine !== undefined) {
            this._SearchEngine = parseInt(localStorage.SearchEngine);
        }
    }
}