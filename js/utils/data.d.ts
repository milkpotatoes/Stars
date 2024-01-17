interface Engine {
    name: string,
    url: string,
    // homepage
    index: string,
    icon: string,
    logo: string,
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