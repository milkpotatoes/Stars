/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

import { CustomShortcutsCollection } from "./customShortcutsCollection";
import { SearchEngineManager } from "./searchEngineManager";
import { StartProfile } from "./utils/data";

enum SearchMode {
    HELP = 0,
    DEFAULT = 1,
    HISTORY = 2,
    FILTER = 3,
    CUSTOM = 4,
}

interface SearchOptions {
    mode: SearchMode;
    key?: string | null;
    query?: string | null;
}

class NormalPanel {
    input: HTMLInputElement;
    elem: HTMLElement;
    focus: number;
    searchPanel: SearchPanel | null;
    constructor(input: HTMLInputElement): void;
    registerSearchPanel(searchPanel: SearchPanel): void;
    hide(): void;
    show(): void;
    getItems(): number;
    focusAt(id?: number): void;
    focusNext(): void;
    focusPrev(): void;
    applyChoice(item?: HTMLElement): void;
    setEventListener(): void;
}

class CommandPanel extends NormalPanel {
    profiler: StartProfile;
    manager: SearchEngineManager;
    constructor(input: HTMLInputElement, profiler: StartProfile,
        manager: SearchEngineManager): void;
}

export default class SearchPanel {
    static SEARCH_MODE: SearchMode;
    collection: CustomShortcutsCollection;
    searchMode: SearchMode;
    profiler: StartProfile;
    panels: {
        HELP_PANEL: NormalPanel,
        COMMAND_PANEL: NormalPanel,
        HISTORY_PANEL: NormalPanel
    } | undefined;
    constructor(collection: CustomShortcutsCollection,
        manager: SearchEngineManager,
        profiler: StartProfile): void;

    checkSearchMode(key: string): SearchOptions;
    showSearchPanel(options: SearchOptions): void;
    smartSearchBar(key: string): void;
    setEventListener(): void;
}