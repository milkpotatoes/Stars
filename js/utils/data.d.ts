/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT License
 */

interface Engine {
    name: string,
    url: string,
    // homepage
    index: string,
    icon: string,
    logo: string,
}


export class Shortcut {
    static SHORTCUT_TYPE_SHORTCUT = 0;
    static SHORTCUT_TYPE_WIDGET = 1;
    elm: HTMLElement;
    type: Shortcut.SHORTCUT_TYPE_SHORTCUT | Shortcut.SHORTCUT_TYPE_WIDGET;
    name: string;
    icon: string;
    icon: string;
    desc: string;
    parent: ShortcutCollections;

    setClickEvent(): void;
    setEditEvent(): void;
    setDeleteEvent(): void;
    setDraggableEvent(): void;
    setDragEvent(): void;
    setListener(): void;

    constructor(name: string, url: string, icon: string, desc?: string, parent?: ShortcutCollections,
        type?: Shortcut.SHORTCUT_TYPE_SHORTCUT | Shortcut.SHORTCUT_TYPE_WIDGET): Shortcut;

    bind(collection: ShortcutCollections): void;

    open(): void;
    remove(): void;
    edit(): void;
}

export class StartProfile {
    static INNER_DIV = 64;
    INNER_SEARCH_ENGINES = SEARCH_ENGINES;
    CustomSearchEngine: Engine[];
    saveCustomSearchEngine(): void;
    addCustomSearchEngine(engine: Engine): number | null;
    DisabledSearchEngine: number[];
    eachEngine(callback: (engine: Engine, id: number) => void): void;
    SearchEngine: number;
    getSearchEngine(id: number): Engine;
    modifyDefaultEngine(engine_id: number): void;
}

interface History {
    key: string,
    time: number,
}

export class SearchHistory {
    searchHistory: History[];
    forEach(callback: (history: History, index: number) => void): void
    filterHistory(key: string): History[];
    deleteHistory(key: string): void;
}