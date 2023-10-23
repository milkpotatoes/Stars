import { ShortcutCollections, StartProfile, Shortcut } from "./data.js";
import { AlertDialog } from "./alertdialog.js";
import { STATIC_SOURCE } from "./resource.js";
import { SEARCH_ENGINES } from "./resource.js";

class CustomShortcutsCollection extends ShortcutCollections {
    constructor(elm) {
        super(elm);
        this._add_elm.addEventListener('click', this.userAdd.bind(this));
        if (localStorage.ShortcutLinks !== undefined) {
            const _json = JSON.parse(localStorage.ShortcutLinks);
            for (let link of _json) {
                this.add({
                    name: link.name,
                    url: link.url,
                    icon: link.icon,
                    desc: link.desc
                });
            }
        };
    }
    static showMessage(msg = '') {
        new AlertDialog()
            .setMessage(msg)
            .setPositiveButton('关闭')
            .show()
    }
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                const base64String = reader.result;
                resolve(base64String);
            };

            reader.onerror = function () {
                reject(new Error("Failed to load file"));
            };
        });
    }
    saveLinks() {
        const links = [];
        for (let link of this._shortcutCollections) {
            links.push({
                name: link.name,
                url: link.url,
                desc: link.desc,
                icon: link.icon,
            });
        }
        localStorage.ShortcutLinks = JSON.stringify(links);
    }
    remove(id) {
        const val = super.remove(id);
        this.saveLinks();
        return val;
    }
    editAddDialog(onsuccess = undefined, name = '', url = '', icon = undefined, desc = '') {
        const custonView = `<style>div {display: grid; grid-template-columns: 72px 1fr; grid-template-rows: repeat(3, 32px); grid-template-areas: "i n" "i u" "i d"; gap: 4px 16px; align-items: center; } .icon { grid-area: i; width: 72px; height: 72px; background: rgba(0 0 0 / .1); } </style> <div> <img class="icon" src="src/image_FILL0_wght400_GRAD0_opsz24.svg"> <input type="file" style="display: none;" class="icon" accept="image/*"> <input type="text" placeholder="名称" class="name"><input type="text" placeholder="链接" class="url"><input type="text" placeholder="描述" class="desc"></div>`
        const collection = this;
        const dialog = new AlertDialog()
            .setTitle('添加')
            .setView(custonView)
            .setPositiveButton('确定', function () {
                const _name = this.querySelector("input.name").value;
                const _icon = this.querySelector("img.icon").src;
                const _url = this.querySelector("input.url").value;
                const _desc = this.querySelector("input.desc").value;
                if (_name === '') {
                    CustomShortcutsCollection.showMessage('名称不能为空')
                } else if (_url === '') {
                    CustomShortcutsCollection.showMessage('链接不能为空')
                } else {
                    try {
                        new URL(_url);
                        if (typeof onsuccess === 'function') {
                            onsuccess(_name, _url, _icon, _desc);
                        }
                        collection.saveLinks();
                        this.close();
                    } catch {
                        CustomShortcutsCollection.showMessage('链接格式错误');
                    }
                }
                return true;
            })
            .setNeturalButton('获取网站icon', function () {
                const url = this.querySelector("input.url").value;
                const icon = this.querySelector("img.icon");
                const prev_icon = icon.src;
                try {
                    const url1 = new URL(url).origin + '/favicon.ico';
                    icon.onerror = () => {
                        CustomShortcutsCollection.showMessage('获取失败，请手动选择图标');
                        icon.src = prev_icon;
                        icon.onerror = undefined;
                    };
                    icon.src = url1;
                } catch {
                    CustomShortcutsCollection.showMessage('请输入正确的链接后再试');
                }
                return true;
            })
            .setNegativeButton('取消')
            .show();
        const preview = dialog.querySelector('img.icon');
        const file_select = dialog.querySelector('input.icon');
        if (icon !== undefined) preview.src = icon;
        dialog.querySelector('.name').value = name;
        dialog.querySelector('.url').value = url;
        dialog.querySelector('.desc').value = desc;
        preview.addEventListener('click', () => {
            file_select.click();
        });
        file_select.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                CustomShortcutsCollection.fileToBase64(files[0])
                    .then(base64 => {
                        preview.src = base64;
                    });
            }
        });
    }
    edit(id) {
        const link = this.at(id);
        this.editAddDialog((name, url, icon, desc) => {
            link.name = name;
            link.url = url;
            link.icon = icon;
            link.desc = desc;
        }, link.name, link.url, link.icon, link.desc);
    }
    userAdd() {
        this.editAddDialog((name, url, icon, desc) => {
            this.add({
                name: name,
                url: url,
                icon: icon,
                desc: desc,
            });
        })
    }
}

const SEARCH_ENGINE = document.querySelector('.search-icon');
const SEARCH_ENGINE_SELECT = document.querySelector('.search-select');
const SEARCH_ENGINE_TEMPLATE = SEARCH_ENGINE_SELECT.querySelector('template');
const SEARCH_ENGINE_LOGO = document.querySelector('.search-logo');
const SEARCH_BUTTON = document.querySelector('.search-button');
const SEARCH_INPUT = document.querySelector('#search-key');
const startProfile = new StartProfile();
new CustomShortcutsCollection(document.querySelector('.shortcuts'));

async function getPrimaryColor(image) {
    let img = new Image();
    return new Promise((reslove, _reject) => {
        img.onload = () => {
            reslove(colorfulImg(img));
        }
        img.src = image;
    });
}

document.documentElement.style.backgroundImage = `url(${STATIC_SOURCE.WALLPAPER})`;
getPrimaryColor(STATIC_SOURCE.WALLPAPER)
    .then(e => {
        document.documentElement.style.backgroundColor = `rgb(${e.r}, ${e.g}, ${e.b})`;
    });

SEARCH_ENGINES.forEach((e, i) => {
    const search_item = SEARCH_ENGINE_TEMPLATE.content.cloneNode(true);
    search_item.querySelector('div').data = i;
    search_item.querySelector('.icon').style.backgroundImage = `url(${STATIC_SOURCE[e.icon]})`;
    search_item.querySelector('.name').textContent = e.name;
    if (startProfile.SearchEngine === i) {
        search_item.querySelector('div').classList.add('selected');
        modifySearchEngine(i);
    }
    SEARCH_ENGINE_SELECT.append(search_item);
});

SEARCH_ENGINE_SELECT.style.cssText = `--items: ${SEARCH_ENGINES.length}`;

function modifySearchEngine(id) {
    const engine = SEARCH_ENGINES[id];
    startProfile.SearchEngine = id;
    SEARCH_ENGINE.style.backgroundImage = `url(${STATIC_SOURCE[engine.icon]})`;
    document.querySelector('.search-logo').style.backgroundImage = `url(${STATIC_SOURCE[engine.logo]})`;
}

function showSearchEngineSelect(show = false) {
    if (show === false) {
        SEARCH_ENGINE_SELECT.classList.add('hidden');
        setTimeout(() => {
            SEARCH_ENGINE_SELECT.style.display = 'none';
        }, 200);
    } else if (show >= 0 && show < SEARCH_ENGINES.length) {
        SEARCH_ENGINE_SELECT.style.display = 'grid';
        SEARCH_ENGINE_SELECT.style.transform = `translate(0, -${(show + 1) * 40}px)`;
        setTimeout(() => {
            SEARCH_ENGINE_SELECT.classList.remove('hidden');
        }, 50);
    }
}

SEARCH_ENGINE.addEventListener('click', e => {
    showSearchEngineSelect(startProfile.SearchEngine);
    e.stopPropagation();
});


SEARCH_ENGINE_LOGO.addEventListener('click', () => {
    const engine = SEARCH_ENGINES[startProfile.SearchEngine];
    location.assign(engine.index);
})

SEARCH_ENGINE_SELECT.addEventListener('click', e => {
    const engine_id = e.target.closest('div').data;
    showSearchEngineSelect(engine_id);
    SEARCH_ENGINE_SELECT.querySelector('.selected').classList.remove('selected');
    e.target.closest('div').classList.add('selected');
    modifySearchEngine(engine_id);
    setTimeout(() => {
        showSearchEngineSelect(false);
    }, 300);
    e.stopPropagation();
});

SEARCH_BUTTON.addEventListener('click', e => {
    if (SEARCH_INPUT.value !== '') {
        const engine = SEARCH_ENGINES[startProfile.SearchEngine];
        location.assign(engine.url.replace(/%s/, encodeURIComponent(SEARCH_INPUT.value)));
    };
    e.preventDefault();
});

app.addEventListener('click', e => {
    showSearchEngineSelect(false);
});