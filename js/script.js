import { ShortcutCollections, StartProfile, Shortcut } from "./data.js";
import { AlertDialog } from "./alertdialog.js";
import { STATIC_SOURCE } from "./resource.js";
import { colorfulImg } from "./colorfulimg.js";

class CustomShortcutsCollection extends ShortcutCollections {
    static PAGE_SIZE = 40;
    static PAGE_HEIGHT = 620;
    _currentPage = 0;
    get pagesCount() {
        return Math.ceil((this.size() + 1) / CustomShortcutsCollection.PAGE_SIZE);
    }
    get currentPage() {
        return this._currentPage;
    };
    set currentPage(page) {
        page = Math.max(Math.min(this.pagesCount - 1, page), 0);
        this._elm.scrollTop = page * CustomShortcutsCollection.PAGE_HEIGHT;
        const container = this._elm.querySelector('.pages-indicator');
        container.querySelector('.current').classList.remove('current');
        container.children[page].classList.add('current');
        this._currentPage = page;
    }
    constructor(elm) {
        super(elm);
        this._add_elm.addEventListener('click', this.userAdd.bind(this));
        if (localStorage.ShortcutLinks !== undefined) {
            const _json = JSON.parse(localStorage.ShortcutLinks);
            if (!localStorage.AddedProjectIndex) {
                _json.splice(0, 0, this.projectIndex());
            }
            for (let link of _json) {
                this.add({
                    name: link.name,
                    url: link.url,
                    icon: link.icon,
                    desc: link.desc
                });
            }
        };
        this.saveLinks();
    };
    static showMessage(msg = '') {
        new AlertDialog()
            .setMessage(msg)
            .setPositiveButton('关闭')
            .show();
    };
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
    };
    refreshPageIndicator() {
        const pagesIndicator = this._elm.querySelector('.pages-indicator');
        const indicators = pagesIndicator.querySelectorAll('.page-indicator');
        indicators.forEach(element => {
            element.remove();
        });
        const pages = this.pagesCount;
        for (let i = 0; i < pages; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('page-indicator');
            if (i === this.currentPage) {
                indicator.classList.add('current');
            }
            indicator.addEventListener('click', function () {
                this.currentPage = i;
            }.bind(this));
            pagesIndicator.append(indicator);
        };
    };
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
        this.refreshPageIndicator();
    };
    remove(id) {
        const val = super.remove(id);
        this.saveLinks();
        return val;
    };
    editAddDialog(onsuccess = undefined, name = '', url = '', icon = undefined, desc = '') {
        const customView = `<style>div {display: grid; grid-template-columns: 96px 1fr; grid-template-rows: repeat(3, 32px); grid-template-areas: "i n" "i u" "i d"; gap: 12px; align-items: center; } .icon { grid-area: i; width: 96px; height: 96px; background: rgba(0 0 0 / .1); object-fit: contain; border-radius: 8px; padding: 8px; box-sizing: border-box;} </style> <div> <img class="icon" src="src/image_FILL0_wght400_GRAD0_opsz24.svg"> <input type="file" style="display: none;" class="icon" accept="image/*"> <input type="text" placeholder="名称" class="name"><input type="text" placeholder="链接" class="url"><input type="text" placeholder="描述" class="desc"></div>`;
        const collection = this;
        const dialog = new AlertDialog()
            .setTitle('添加')
            .setView(customView)
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
    };
    edit(id) {
        const link = this.at(id);
        this.editAddDialog((name, url, icon, desc) => {
            link.name = name;
            link.url = url;
            link.icon = icon;
            link.desc = desc;
        }, link.name, link.url, link.icon, link.desc);
    };
    userAdd() {
        this.editAddDialog((name, url, icon, desc) => {
            this.add({
                name: name,
                url: url,
                icon: icon,
                desc: desc,
            });
        })
    };
    projectIndex() {
        localStorage.AddedProjectIndex = new Date().getTime();
        return {
            name: '项目主页',
            url: 'https://gitee.com/milkpotatoes/stars',
            icon: 'src/start-512x512.png',
            desc: '个性化新建标签页',
        };
    }
}

const SEARCH_ENGINE = document.querySelector('.search-icon');
const SEARCH_ENGINE_SELECT = document.querySelector('.search-select');
const SEARCH_ENGINE_MANAGE = SEARCH_ENGINE_SELECT.querySelector('.manage-search-engine');
const SEARCH_ENGINE_TEMPLATE = SEARCH_ENGINE_SELECT.querySelector('template');
const SEARCH_ENGINE_LOGO = document.querySelector('.search-logo');
const SEARCH_BUTTON = document.querySelector('.search-button');
const SEARCH_INPUT = document.querySelector('#search-key');
const startProfile = new StartProfile();
const SHORTCUTS_COLLECTION_CONTAINER = document.querySelector('.shortcuts')
const customShortcutsCollection = new CustomShortcutsCollection(SHORTCUTS_COLLECTION_CONTAINER);
const ActivatedSearchEngine = [];

async function getPrimaryColor(image) {
    let img = new Image();
    return new Promise((reslove, _reject) => {
        img.onload = () => {
            reslove(colorfulImg(img));
        }
        img.src = image;
    });
}

function setWallpaper(wallpaper) {
    document.querySelector('.wallpaper').style.backgroundImage = `url(${wallpaper})`;
    getPrimaryColor(wallpaper)
        .then(e => {
            document.documentElement.style.backgroundColor = `rgb(${e.r}, ${e.g}, ${e.b})`;
        });
};
setWallpaper(STATIC_SOURCE.WALLPAPER);

function modifySearchEngine(id) {
    SEARCH_ENGINE.style.backgroundImage = `url(${startProfile.getEngineIcon(id)})`;
    const logo = document.querySelector('.search-logo');
    logo.classList.add('modifying');
    setTimeout(() => {
        logo.style.backgroundImage = `url(${startProfile.getEngineLogo(id)})`;
    }, 300);
    setTimeout(() => {
        logo.classList.remove('modifying');
    }, 600);
    startProfile.SearchEngine = id;
}

modifySearchEngine(startProfile.SearchEngine);

function modifyActivatedSearchEngine() {
    ActivatedSearchEngine.splice(0);
    for (const i = 1; SEARCH_ENGINE_SELECT.children.length > 2;) {
        SEARCH_ENGINE_SELECT.children[i].remove();
    }
    startProfile.eachEngine((e, i) => {
        if (e.disabled) {
            return
        }
        ActivatedSearchEngine.push(i);
        const search_item = SEARCH_ENGINE_TEMPLATE.content.cloneNode(true);
        search_item.querySelector('div').data = i;
        search_item.querySelector('.icon').style.backgroundImage = `url(${startProfile.getEngineIcon(i)})`;
        search_item.querySelector('.name').textContent = e.name;
        if (startProfile.SearchEngine === i) {
            search_item.querySelector('div').classList.add('selected');
            modifySearchEngine(i);
        }
        SEARCH_ENGINE_MANAGE.before(search_item);
    });
    SEARCH_ENGINE_SELECT.style.cssText = `--items: ${ActivatedSearchEngine.length + 1}`;
}
modifyActivatedSearchEngine();
function showSearchEngineSelect(show = false) {
    const order = ActivatedSearchEngine.indexOf(show);
    if (show === false) {
        SEARCH_ENGINE_SELECT.classList.add('hidden');
        setTimeout(() => {
            SEARCH_ENGINE_SELECT.style.display = 'none';
        }, 200);
    } else if (show >= 0 && order < startProfile.getEngineCount()) {
        SEARCH_ENGINE_SELECT.style.display = 'grid';
        SEARCH_ENGINE_SELECT.style.transform = `translate(0, -${(order + 1) * 40}px)`;
        setTimeout(() => {
            SEARCH_ENGINE_SELECT.classList.remove('hidden');
        }, 50);
    }
}

function alertMessage(msg) {
    new AlertDialog()
        .setMessage(msg)
        .setPositiveButton('确定')
        .show()
}

function editSearchIcon(icon = '', logo = '', url = '', editable = true) {
    return new Promise((reslove, reject) => {
        const customView = `<style> .material-icon { font-family: "material-icon"; } .container { display: grid; grid-template-columns: 1fr 32px 96px 1fr; grid-template-rows: 128px 32px; gap: 16px; grid-template-areas: "l l l l" ". i b ."; align-items: center; justify-items: center; } .icon { width: 20px; height: 20px; user-select: none; } span.icon { width: 32px; height: 32px; font-size: 20px; line-height: 32px; border-radius: 4px; text-align: center; transition: ease-in-out .2s; } div.icon { grid-area: i; width: 32px; height: 32px; user-select: none; background-image: url(../src/image_FILL0_wght400_GRAD0_opsz24.svg); border-radius: 50%; overflow: hidden; padding: 4px; } .logo { grid-area: l; color: rgba(0 0 0 / .4); font-size: 2em; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 16px; } .logo, div.icon { box-sizing: border-box; background: rgba(0 0 0 / .15) center no-repeat; background-size: contain; background-origin: content-box; } button.use-favicon { grid-area: b; } </style> <div class="container"> <input type="file" accept="image/*" style="display: none;" /> <div class="logo">点击设置Logo</div> <div class="icon"></div><button class="use-favicon">使用favicon</button> </div>`;
        new AlertDialog()
            .setTitle((editable ? '修改' : '查看') + 'Logo')
            .setView(customView)
            .setPositiveButton('确定', function () {
                const view = this.getView();
                const logo_view = view.querySelector('.logo').style.backgroundImage.match(/url\("(.+)"\)/)?.[1] ?? '';
                const icon_view = view.querySelector('div.icon').style.backgroundImage.match(/url\("(.+)"\)/)?.[1] ?? '';
                reslove([logo_view, icon_view]);
            })
            .setNegativeButton('取消')
            .onShow(function (e) {
                const file_select = this.querySelector('input[type=file]');
                const logo_view = this.querySelector('.logo');
                const icon_view = this.querySelector('div.icon');
                const use_favicon = this.querySelector('.use-favicon');
                if (icon !== '') {
                    icon_view.style.backgroundImage = `url(${icon})`;
                } else {
                    icon_view.style.backgroundImage = `url(src/image_FILL0_wght400_GRAD0_opsz24.svg)`;
                }
                if (logo !== '') {
                    logo_view.textContent = '';
                    logo_view.style.backgroundImage = `url(${logo})`;
                }
                if (url === '') {
                    use_favicon.disabled = true;
                }
                if (editable) {
                    logo_view.addEventListener('click', () => {
                        file_select.target = logo_view;
                        file_select.click();
                    });
                    icon_view.addEventListener('click', () => {
                        file_select.target = icon_view;
                        file_select.click();
                    });
                    file_select.addEventListener('input', () => {
                        if (file_select.files.length > 0)
                            CustomShortcutsCollection.fileToBase64(file_select.files[0])
                                .then(base64 => {
                                    file_select.target.style.backgroundImage = `url(${base64})`;
                                    file_select.target.textContent = '';
                                });
                        file_select.value = '';
                    });
                    if (url !== '') {
                        use_favicon.addEventListener('click', () => {
                            icon_view.style.backgroundImage = `url(${new URL('favicon.ico', new URL(url).origin).href})`;
                        })
                    }
                } else {
                    use_favicon.disabled = true;
                }
            })
            .onClose(() => {
                reject('cancled');
            })
            .show();
    });
}

function genISEConfig({ name, url, index, disabled }, id) {
    const uniTemplate = '<dd class="${type} ${status}" data="${id}"><img class="icon" src="${icon}"> <input type="text" placeholder="名称" class="name" value="${name}" ${disabled}><input type="text" placeholder="链接, 使用\"%s\"代替搜索词" class="url" value="${url}" ${disabled}><input type="text" placeholder="首页" class="index" value="${index}" ${disabled}><span class="icon material-icon ${action}"></span> </dd>';
    return uniTemplate
        .replace(/\$\{disabled\}/g, 'disabled')
        .replace(/\$\{type\}/g, 'inner')
        .replace(/\$\{icon\}/g, startProfile.getEngineIcon(id))
        .replace(/\$\{name\}/g, name)
        .replace(/\$\{url\}/g, url)
        .replace(/\$\{index\}/g, index)
        .replace(/\$\{status\}/g, disabled ? 'disabled' : 'enabled')
        .replace(/\$\{id\}/g, id)
        .replace(/\$\{action\}/g, disabled ? 'restore' : 'block');
}

function genCSEConfig({ name, url, index }, id) {
    const uniTemplate = '<dd class="${type} ${status}" data="${id}"><img class="icon" src="${icon}"> <input type="text" placeholder="名称" class="name" value="${name}" ${disabled}><input type="text" placeholder="链接, 使用\"%s\"代替搜索词" class="url" value="${url}" ${disabled}><input type="text" placeholder="首页" class="index" value="${index}" ${disabled}><span class="icon material-icon ${action}"></span> </dd>';
    return uniTemplate.replace(/\$\{disabled\}/g, '')
        .replace(/\$\{type\}/g, 'custom')
        .replace(/\$\{status\}/g, 'enabled')
        .replace(/\$\{action\}/g, 'remove')
        .replace(/\$\{icon\}/g, startProfile.getEngineIcon(id))
        .replace(/\$\{name\}/g, name)
        .replace(/\$\{url\}/g, url)
        .replace(/\$\{index\}/g, index)
        .replace(/\$\{id\}/g, id);
}

function discordChanges() {
    return new Promise((reslove, reject) => {
        new AlertDialog()
            .setTitle('提示')
            .setMessage('您当前未保存的自定义搜索引擎，仍然退出吗？')
            .setPositiveButton('确定', () => {
                reslove('ok');
            })
            .setNegativeButton('取消', () => {
                reject('canceled');
            })
            .setModal(true)
            .show()
    });
}

function manageSearchEngines() {
    let searchEngine = '';

    startProfile.eachEngine((e, i) => {
        if (i < StartProfile.INNER_DIV) {
            searchEngine += genISEConfig(e, i);
        } else {
            searchEngine += genCSEConfig(e, i);
        }
    });

    const buttonListener = function () {
        const inputs = this.querySelectorAll('.add-item input');
        let notsaved = false;
        inputs.forEach(element => {
            notsaved = notsaved || element.value !== '';
        });
        if (notsaved) {
            discordChanges()
                .then(() => {
                    this.close();
                })
                .catch(() => {
                    return true;
                });
            return true;
        }
        return false;
    };

    const default_icon = 'src/image_FILL0_wght400_GRAD0_opsz24.svg';
    const customView = `<style> .material-icon { font-family: "material-icon"; } dl {display: grid; grid-template-columns: 1fr; grid-auto-rows: 32px; gap: 8px; align-items: center; padding: 0; margin: 0; } .icon { width: 20px; height: 20px; user-select: none; } dd { margin: 0; display: grid; grid-template-columns: 24px .4fr 1fr .8fr 24px; gap: 8px; align-items: center; } dt { opacity: .8; font-size: .8em; padding-top: 8px; } span.icon { width: 32px; height: 32px; font-size: 20px; line-height: 32px; border-radius: 4px; text-align: center; transition: ease-in-out .2s; } span.icon:hover { background: rgba(0 0 0 / .2); } .icon.block::before { content: "\\e14b" } .icon.remove::before { content: "\\e14c" } .icon.restore::before, .icon.add::before { content: "\\e145" } .hide-disabled .disabled { display: none; } .disabled { order: 1; } .disabled > * { opacity: .6; } .disabled > .icon.restore { opacity: 1 } dt { user-select: none; pointer: default; } .hide-disabled dt::before { content: "►"; } .show-disabled dt::before { content: "▼"; } </style> <div class="hide-disabled"> <dl> ${searchEngine} <dd class="add-item"> <img class="icon" src="${default_icon}"> <input type="text" placeholder="名称" class="name"><input type="text" placeholder="链接, 使用 &quot;%s&quot; 代替搜索词" class="url" value=""><input type="text" placeholder="首页" class="index" value=""><span class="icon material-icon add"></span></dd> <dt> 已禁用</dt> </dl> </div>`;
    new AlertDialog()
        .setTitle('管理搜索引擎')
        .setView(customView)
        .setPositiveButton('确定', buttonListener)
        .setNegativeButton('关闭', buttonListener)
        .setModal(true)
        .onShow(function (view) {
            const list = view.querySelector('div');
            view.querySelector('dt').addEventListener('click', () => {
                if (list.classList.contains('hide-disabled')) {
                    list.classList.remove('hide-disabled');
                    list.classList.add('show-disabled');
                } else {
                    list.classList.remove('show-disabled');
                    list.classList.add('hide-disabled');
                };
            });
            list.addEventListener('click', e => {
                const item = e.target.closest('dd');
                const id = parseInt(item?.getAttribute('data') ?? '-1');
                const target = e.target;
                const classList = target.classList;
                if (classList.contains('block')) {
                    if (id === startProfile.SearchEngine) {
                        return;
                    }
                    try {
                        startProfile.disableInnerEngine(id);
                        classList.remove('block');
                        classList.add('restore');
                        target.closest('dd').classList.add('disabled');
                    } catch (error) {
                    }
                } else if (classList.contains('restore')) {
                    classList.add('block');
                    classList.remove('restore');
                    target.closest('dd').classList.remove('disabled');
                    startProfile.enableInnerEngine(id);
                } else if (classList.contains('remove')) {
                    let next_item = item.nextElementSibling;
                    while (!next_item.classList.contains('add-item')) {
                        const old_id = parseInt(next_item.getAttribute('data'))
                        next_item.setAttribute('data', old_id - 1);
                        next_item = next_item.nextElementSibling;
                    }
                    item.remove();
                    startProfile.removeCustomSearchEngine(id);
                } else if (classList.contains('add')) {
                    const default_icon_src = new URL(default_icon, location.origin).href;
                    const img_el = item.querySelector('img.icon');
                    const icon = img_el.src;
                    const logo = img_el.data;
                    const name = item.querySelector('.name').value;
                    const url = item.querySelector('.url').value;
                    const index = item.querySelector('.index').value;
                    if (icon === '' || icon === default_icon_src) {
                        alertMessage('请先设置图标');
                        return;
                    };
                    if (name === '' || url === '' || index === '') {
                        alertMessage('名称、链接、主页不可为空');
                        return;
                    };
                    if (!url.match(/%s/)) {
                        alertMessage('链接不包含搜索词, 请检查');
                        return;
                    };
                    const engineConfig = {
                        name: name,
                        icon: icon,
                        logo: logo ?? '',
                        url: url,
                        index: index,
                    };
                    const id = startProfile.addCustomSearchEngine(engineConfig);
                    const new_item = document.createElement('div');
                    new_item.innerHTML = genCSEConfig(engineConfig, id)
                    item.before(new_item.children[0]);
                    img_el.src = default_icon;
                    img_el.data = undefined;
                    item.querySelector('.name').value = '';
                    item.querySelector('.url').value = '';
                    item.querySelector('.index').value = '';
                } else if (target instanceof HTMLImageElement) {
                    if (item.classList.contains('add-item')) {
                        editSearchIcon(target.src ?? '', target.data ?? '', item.querySelector('.url').value)
                            .then(r => {
                                const [logo, icon] = r;
                                target.src = icon;
                                target.data = logo;
                            })
                            .catch(() => { });
                    } else if (item.classList.contains('inner')) {
                        editSearchIcon(startProfile.getEngineIcon(id), startProfile.getEngineLogo(id), startProfile.getSearchEngine(id).url, false)
                            .catch(() => { });
                    } else if (item.classList.contains('custom')) {
                        const engine = startProfile.getSearchEngine(id);
                        editSearchIcon(target.src ?? '', engine.logo ?? '', engine.url, true)
                            .then(r => {
                                const [logo, icon] = r;
                                target.src = icon;
                                engine.icon = icon;
                                engine.logo = logo;
                                startProfile.saveCustomSearchEngine();
                            })
                            .catch(() => { });
                    }
                }
            });
        })
        .onClose(() => {
            modifyActivatedSearchEngine();
        })
        .show();
};

function manageConfigs() {
    new AlertDialog()
        .setTitle('设置')
        .setMessage('施工中，请等待后续更新')
        .setPositiveButton('确定')
        .setNegativeButton('关闭')
        .show()
}

SEARCH_ENGINE.addEventListener('click', e => {
    showSearchEngineSelect(startProfile.SearchEngine);
    e.stopPropagation();
});

SEARCH_ENGINE_LOGO.addEventListener('click', () => {
    const engine = startProfile.getSearchEngine();
    location.assign(engine.index);
})

SEARCH_ENGINE_SELECT.addEventListener('click', e => {
    const engine_id = e.target.closest('div').data;
    if (engine_id === undefined) {
        manageSearchEngines();
        showSearchEngineSelect(false);
        return;
    }
    if (startProfile.SearchEngine !== engine_id) {
        showSearchEngineSelect(engine_id);
        SEARCH_ENGINE_SELECT.querySelector('.selected')?.classList.remove('selected');
        e.target.closest('div').classList.add('selected');
        modifySearchEngine(engine_id);
        setTimeout(() => {
            showSearchEngineSelect(false);
        }, 250);
    } else {
        showSearchEngineSelect(false);
    }
    e.stopPropagation();
});

SEARCH_BUTTON.addEventListener('click', e => {
    if (SEARCH_INPUT.value !== '') {
        const engine = startProfile.getSearchEngine();
        location.assign(engine.url.replace(/%s/, encodeURIComponent(SEARCH_INPUT.value)));
    };
    e.preventDefault();
});

app.addEventListener('click', () => {
    showSearchEngineSelect(false);
});

SHORTCUTS_COLLECTION_CONTAINER.addEventListener('dragover', e => {
    e.preventDefault();
    const dragItem = document.querySelector('.shortcut.dragging');
    const hoverItem = e.target.closest('.shortcut') ?? e.target;
    const itemBorder = hoverItem.getClientRects()[0];
    if (dragItem && hoverItem !== dragItem && hoverItem.classList.contains('shortcut')) {
        if (e.pageX < (itemBorder.x + itemBorder.width / 2)) {
            hoverItem.before(dragItem);
        } else {
            if (!hoverItem.classList.contains('add-shortcut')) {
                hoverItem.after(dragItem);
            } else {
                hoverItem.before(dragItem);
            }
        }
    };
    e.dataTransfer.dropEffect = 'move';
});

SHORTCUTS_COLLECTION_CONTAINER.addEventListener('drop', e => {
    const draggingElement = document.querySelector('.shortcut.dragging');

    const container = draggingElement.data.parent;
    let old_id = 0;
    let new_id = 0;
    for (let i = 0; i < container.size(); i++) {
        if (container.at(i) === draggingElement.data) {
            old_id = i;
            break;
        }
    }

    for (let i = 1; i < SHORTCUTS_COLLECTION_CONTAINER.children.length; i++) {
        if (SHORTCUTS_COLLECTION_CONTAINER.children[i] === draggingElement) {
            new_id = i - 1;
            break;
        }
    }

    container._shortcutCollections.splice(new_id, 0, container._shortcutCollections.splice(old_id, 1)[0]);
    container.saveLinks();
    e.preventDefault();
});

class PagesIndicatorStatus {
    pagesIndicator = document.querySelector('.pages-indicator');
    hideTimer = 0;
    constructor() {
        const indicator = this;
        this.hide();
        this.pagesIndicator.addEventListener('mouseenter', () => {
            indicator.show();
        });
    };
    autoHide() {
        const indicator = this;
        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            indicator.hide();
        }, 3000);
    };
    show() {
        this.pagesIndicator.style.filter = 'opacity(1)';
        this.autoHide();
    };
    hide() {
        clearTimeout(this.hideTimer)
        this.pagesIndicator.style.filter = 'opacity(0)';
    }
};
const pagesIndicatorStatus = new PagesIndicatorStatus();

function expandMoreLinks() {
    let deltaY = 0;
    let timer = 0;
    const appRoot = document.querySelector('#app');
    document.addEventListener('mousewheel', e => {
        deltaY += e.deltaY;
        if (appRoot.classList.contains('expand')) {
            pagesIndicatorStatus.show();
        };
        if (deltaY >= 200) {
            if (appRoot.classList.contains('expand')) {
                customShortcutsCollection.currentPage += 1;
            } else {
                customShortcutsCollection.refreshPageIndicator();
                setTimeout(() => {
                    showSearchEngineSelect(false);
                    appRoot.classList.add('expand');
                }, 50);
            };
        } else if (deltaY <= -200) {
            if (appRoot.classList.contains('expand')) {
                if (customShortcutsCollection.currentPage === 0) {
                    appRoot.classList.remove('expand');
                    pagesIndicatorStatus.hide();
                } else {
                    customShortcutsCollection.currentPage -= 1;
                }
            }
        };
        clearTimeout(timer);
        timer = setTimeout(() => {
            deltaY = 0;
        }, 200);
    });
};

expandMoreLinks();
document.querySelector('.search-box input').focus();

document.querySelector('.settings .icon').addEventListener('click', manageConfigs);