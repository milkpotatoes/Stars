/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT License
 */

export const STATIC_SOURCE = {
    WALLPAPER: 'src/dave-hoefler-W1B7JP4KUp8-unsplash.webp',
    GOOGLE_LOGO: 'src/googlelogo_color_272x92dp.png',
    GOOGLE_ICON: 'src/googleg_standard_color_128dp.png',
    BING_LOGO: 'src/bing-logo.svg',
    BING_ICON: 'src/bing-icon.png',
    WUZHUI_LOGO: 'src/4c2fbdc441989d18.svg',
    WUZHUI_ICON: 'src/4c2fbdc441989d18-icon.svg',
    DUCKDUCKGO_LOGO: 'src/duckduckgo.svg',
    DUCKDUCKGO_ICON: 'src/duckduckgo-icon.svg',
    S360_LOGO: 'src/360-search-logo.svg',
    S360_ICON: 'src/121a1737750aa53d.ico',
    SOGOU_LOGO: 'src/logo_880x280_06c7476.png',
    SOGOU_ICON: 'src/sogou.ico',
}

export const SEARCH_ENGINES = [
    {
        name: 'Google',
        index: 'https://www.google.com/',
        url: 'https://www.google.com/search?q=%s',
        logo: 'GOOGLE_LOGO',
        icon: 'GOOGLE_ICON',
        default: true,
    },
    {
        name: 'Bing',
        index: 'https://www.bing.com/',
        url: 'https://www.bing.com/search?q=%s',
        logo: 'BING_LOGO',
        icon: 'BING_ICON',
    },
    {
        name: 'Bing (EN)',
        index: 'https://www.bing.com/?ensearch=1',
        url: 'https://www.bing.com/?q=%s&ensearch=1',
        logo: 'BING_LOGO',
        icon: 'BING_ICON',
    },
    {
        name: '无追搜索',
        index: 'https://www.wuzhuiso.com/',
        url: 'https://www.wuzhuiso.com/s?ie=utf-8&q=%s',
        logo: 'WUZHUI_LOGO',
        icon: 'WUZHUI_ICON',
    },
    {
        name: 'DuckDuckGo',
        index: 'https://duckduckgo.com/',
        url: 'https://duckduckgo.com/?t=h_&q=%s',
        logo: 'DUCKDUCKGO_LOGO',
        icon: 'DUCKDUCKGO_ICON',
    },
    {
        name: '360搜索',
        index: 'https://www.so.com/',
        url: 'https://www.so.com/s?ie=utf-8&q=%s',
        logo: 'S360_LOGO',
        icon: 'S360_ICON',
    },
    {
        name: '搜狗搜索',
        index: 'https://www.sogou.com/',
        url: 'https://www.sogou.com/web?query=%s',
        logo: 'SOGOU_LOGO',
        icon: 'SOGOU_ICON',
    },
];