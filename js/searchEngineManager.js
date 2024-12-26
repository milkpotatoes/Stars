/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT License
 */

import { AlertDialog } from "./utils/alertdialog.js";
import { StartProfile } from "./utils/data.js";
import { fileToBase64, alertMessage } from "./utils/utils.js";

const ActivatedSearchEngine = [];

const SEARCH_ENGINE = document.querySelector('.search-icon');
const SEARCH_ENGINE_SELECT = document.querySelector('.search-select');
const SEARCH_ENGINE_MANAGE = SEARCH_ENGINE_SELECT.querySelector('.manage-search-engine');
const SEARCH_ENGINE_TEMPLATE = SEARCH_ENGINE_SELECT.querySelector('template');

function discordChanges() {
    return new Promise((resolve, reject) => {
        new AlertDialog()
            .setTitle('提示')
            .setMessage('您当前未保存的设置，仍然退出吗？')
            .setPositiveButton('确定', () => {
                resolve('ok');
            })
            .setNegativeButton('取消', () => {
                reject('canceled');
            })
            .setModal(true)
            .show()
    });
}


const default_icon = 'src/image_FILL0_wght400_GRAD0_opsz24.svg';
const default_icon_src = new URL(default_icon, location.origin).href;

const manageSearchEnginesDialog = (view, this_) => {
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
            if (id === this_.startProfile.SearchEngine) {
                return;
            }
            try {
                this_.startProfile.disableInnerEngine(id);
                classList.remove('block');
                classList.add('restore');
                target.closest('dd').classList.add('disabled');
            } catch (error) {
            }
        } else if (classList.contains('restore')) {
            classList.add('block');
            classList.remove('restore');
            target.closest('dd').classList.remove('disabled');
            this_.startProfile.enableInnerEngine(id);
        } else if (classList.contains('remove')) {
            let next_item = item.nextElementSibling;
            while (!next_item.classList.contains('add-item')) {
                const old_id = parseInt(next_item.getAttribute('data'))
                next_item.setAttribute('data', old_id - 1);
                next_item = next_item.nextElementSibling;
            }
            item.remove();
            this_.startProfile.removeCustomSearchEngine(id);
        } else if (classList.contains('add')) {
            const img_el = item.querySelector('img.icon');
            const icon = img_el.src;
            const logo = img_el.data;
            const name = item.querySelector('.name').value;
            const url = item.querySelector('.url').value;
            const index = item.querySelector('.index').value;
            const engineConfig = {
                name: name,
                icon: icon,
                logo: logo ?? '',
                url: url,
                index: index,
            };
            if (!SearchEngineManager.checkEngine(engineConfig)) {
                return;
            }

            const id = this_.startProfile.addCustomSearchEngine(engineConfig);
            const new_item = document.createElement('div');
            new_item.innerHTML = this_.genCSEConfig(engineConfig, id)
            item.before(new_item.children[0]);
            img_el.src = default_icon;
            img_el.data = undefined;
            item.querySelector('.name').value = '';
            item.querySelector('.url').value = '';
            item.querySelector('.index').value = '';
        } else if (target instanceof HTMLImageElement) {
            if (item.classList.contains('add-item')) {
                this_.editSearchIcon(target.src ?? '', target.data ?? '', item.querySelector('.url').value)
                    .then(r => {
                        const [logo, icon] = r;
                        target.src = icon;
                        target.data = logo;
                    })
                    .catch(() => { });
            } else if (item.classList.contains('inner')) {
                this_.editSearchIcon(this_.startProfile.getEngineIcon(id), this_.startProfile.getEngineLogo(id), this_.startProfile.getSearchEngine(id).url, false)
                    .catch(() => { });
            } else if (item.classList.contains('custom')) {
                const engine = this_.startProfile.getSearchEngine(id);
                this_.editSearchIcon(target.src ?? '', engine.logo ?? '', engine.url, true)
                    .then(r => {
                        const [logo, icon] = r;
                        target.src = icon;
                        engine.icon = icon;
                        engine.logo = logo;
                        this_.startProfile.saveCustomSearchEngine();
                    })
                    .catch(() => { });
            }
        }
    });
}

export class SearchEngineManager {
    /**
     * 
     * @param {Engine} engine 
     */
    static checkEngine(engine, alert = true) {
        const { icon, name, url, index } = engine;
        if (icon === '' || icon === default_icon_src) {
            if (alert) alertMessage('请先设置图标');
            return false;
        };
        if (name === '' || url === '' || index === '') {
            if (alert) alertMessage('名称、链接、主页不可为空');
            return false;
        };
        if (!url.match(/%s/)) {
            if (alert) alertMessage('链接不包含搜索词, 请检查');
            return false;
        };
        return true;
    }

    startProfile;

    /**
     * 
     * @param {StartProfile} startProfile 
     */
    constructor(startProfile) {
        this.startProfile = startProfile;
    }
    modifyActivatedSearchEngine() {
        ActivatedSearchEngine.splice(0);
        for (const i = 1; SEARCH_ENGINE_SELECT.children.length > 2;) {
            SEARCH_ENGINE_SELECT.children[i].remove();
        }
        this.startProfile.eachEngine((e, i) => {
            if (e.disabled) {
                return
            }
            ActivatedSearchEngine.push(i);
            const search_item = SEARCH_ENGINE_TEMPLATE.content.cloneNode(true);
            search_item.querySelector('div').data = i;
            search_item.querySelector('.icon').style.backgroundImage = `url(${this.startProfile.getEngineIcon(i)})`;
            search_item.querySelector('.name').textContent = e.name;
            if (this.startProfile.SearchEngine === i) {
                search_item.querySelector('div').classList.add('selected');
                this.modifySearchEngine(i);
            }
            SEARCH_ENGINE_MANAGE.before(search_item);
        });
        SEARCH_ENGINE_SELECT.style.cssText = `--items: ${ActivatedSearchEngine.length + 1}`;
    }

    modifySearchEngine(id) {
        SEARCH_ENGINE.style.backgroundImage = `url(${this.startProfile.getEngineIcon(id)})`;
        const logo = document.querySelector('.search-logo');
        logo.classList.add('modifying');
        setTimeout(() => {
            logo.style.backgroundImage = `url(${this.startProfile.getEngineLogo(id)})`;
        }, 300);
        setTimeout(() => {
            logo.classList.remove('modifying');
        }, 600);
        this.startProfile.modifyDefaultEngine(id);
    }

    useSearchEngine(id) {
        SEARCH_ENGINE.style.backgroundImage = `url(${this.startProfile.getEngineIcon(id)})`;
        const logo = document.querySelector('.search-logo');
        logo.style.transition = 'none';
        logo.style.backgroundImage = `url(${this.startProfile.getEngineLogo(id)})`;
        setTimeout(() => {
            logo.style.transition = '';
        }, 50);
        this.startProfile.SearchEngine = id;
    }

    editSearchIcon(icon = '', logo = '', url = '', editable = true) {
        return new Promise((resolve, reject) => {
            const customView = `<style> .material-icon { font-family: "material-icon"; } .container { display: grid; grid-template-columns: 1fr 32px 96px 1fr; grid-template-rows: 128px 32px; gap: 16px; grid-template-areas: "l l l l" ". i b ."; align-items: center; justify-items: center; } .icon { width: 20px; height: 20px; user-select: none; } span.icon { width: 32px; height: 32px; font-size: 20px; line-height: 32px; border-radius: 4px; text-align: center; transition: ease-in-out .2s; } div.icon { grid-area: i; width: 32px; height: 32px; user-select: none; background-image: url(../src/image_FILL0_wght400_GRAD0_opsz24.svg); border-radius: 50%; overflow: hidden; padding: 4px; } .logo { grid-area: l; color: rgba(0 0 0 / .4); font-size: 2em; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 16px; } .logo, div.icon { box-sizing: border-box; background: rgba(0 0 0 / .15) center no-repeat; background-size: contain; background-origin: content-box; } button.use-favicon { grid-area: b; } </style> <div class="container"> <input type="file" accept="image/*" style="display: none;" /> <div class="logo">点击设置Logo</div> <div class="icon"></div><button class="use-favicon">使用favicon</button> </div>`;
            new AlertDialog()
                .setTitle((editable ? '修改' : '查看') + 'Logo')
                .setView(customView)
                .setPositiveButton('确定', function () {
                    const view = this.getView();
                    const logo_view = view.querySelector('.logo').style.backgroundImage.match(/url\("(.+)"\)/)?.[1] ?? '';
                    const icon_view = view.querySelector('div.icon').style.backgroundImage.match(/url\("(.+)"\)/)?.[1] ?? '';
                    resolve([logo_view, icon_view]);
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
                                fileToBase64(file_select.files[0])
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
                    reject('canceled');
                })
                .show();
        });
    }

    genISEConfig({ name, url, index, disabled }, id) {
        const uniTemplate = '<dd class="${type} ${status}" data="${id}"><img class="icon" src="${icon}"> <input type="text" placeholder="名称" class="name" value="${name}" ${disabled}><input type="text" placeholder="链接, 使用\"%s\"代替搜索词" class="url" value="${url}" ${disabled}><input type="text" placeholder="首页" class="index" value="${index}" ${disabled}><span class="icon material-icon ${action}"></span> </dd>';
        return uniTemplate
            .replace(/\$\{disabled\}/g, 'disabled')
            .replace(/\$\{type\}/g, 'inner')
            .replace(/\$\{icon\}/g, this.startProfile.getEngineIcon(id))
            .replace(/\$\{name\}/g, name)
            .replace(/\$\{url\}/g, url)
            .replace(/\$\{index\}/g, index)
            .replace(/\$\{status\}/g, disabled ? 'disabled' : 'enabled')
            .replace(/\$\{id\}/g, id)
            .replace(/\$\{action\}/g, disabled ? 'restore' : 'block');
    }

    genCSEConfig({ name, url, index }, id) {
        const uniTemplate = '<dd class="${type} ${status}" data="${id}"><img class="icon" src="${icon}"> <input type="text" placeholder="名称" class="name" value="${name}" ${disabled}><input type="text" placeholder="链接, 使用\"%s\"代替搜索词" class="url" value="${url}" ${disabled}><input type="text" placeholder="首页" class="index" value="${index}" ${disabled}><span class="icon material-icon ${action}"></span> </dd>';
        return uniTemplate.replace(/\$\{disabled\}/g, '')
            .replace(/\$\{type\}/g, 'custom')
            .replace(/\$\{status\}/g, 'enabled')
            .replace(/\$\{action\}/g, 'remove')
            .replace(/\$\{icon\}/g, this.startProfile.getEngineIcon(id))
            .replace(/\$\{name\}/g, name)
            .replace(/\$\{url\}/g, url)
            .replace(/\$\{index\}/g, index)
            .replace(/\$\{id\}/g, id);
    }

    showSearchEngineSelect(show = false) {
        const order = ActivatedSearchEngine.indexOf(show);
        if (show === false) {
            SEARCH_ENGINE_SELECT.classList.add('hidden');
            setTimeout(() => {
                SEARCH_ENGINE_SELECT.style.display = 'none';
            }, 200);
        } else if (show >= 0 && order < this.startProfile.getEngineCount()) {
            SEARCH_ENGINE_SELECT.style.display = 'grid';
            SEARCH_ENGINE_SELECT.style.transform = `translate(0, -${(order) * 40}px)`;
            setTimeout(() => {
                SEARCH_ENGINE_SELECT.classList.remove('hidden');
            }, 50);
        }
    }

    manageSearchEngines() {
        let searchEngine = '';

        this.startProfile.eachEngine((e, i) => {
            if (i < StartProfile.INNER_DIV) {
                searchEngine += this.genISEConfig(e, i);
            } else {
                searchEngine += this.genCSEConfig(e, i);
            }
        });

        const buttonListener = function () {
            const inputs = this.querySelectorAll('.add-item input');
            let notSaved = false;
            inputs.forEach(element => {
                notSaved = notSaved || element.value !== '';
            });
            if (notSaved) {
                discordChanges()
                    .then(() => this.close())
                    .catch(() => true);
                return true;
            }
            return false;
        };

        const cancelChanges = function () {
            const inputs = this.querySelectorAll('.custom input');
            let notSaved = false;
            inputs.forEach(element => {
                notSaved = notSaved || element.value !== element.getAttribute('value');
            });
            if (notSaved) {
                discordChanges()
                    .then(() => this.close())
                    .catch(() => true);
                return true;
            }
            return buttonListener.apply(this);
        };

        const saveChanges = function () {
            const customs = this.querySelectorAll('.custom');
            let illegal = [];
            customs.forEach(element => {
                const inputs = element.querySelectorAll('input');
                const engine = this_.startProfile.getSearchEngine(parseInt(element.getAttribute('data')));
                inputs.forEach(input => {
                    const classList = input.classList;
                    if (classList.contains('name')) {
                        engine.name = input.value;
                    } else if (classList.contains('url')) {
                        engine.url = input.value;
                    } else if (classList.contains('index')) {
                        engine.index = input.value;
                    }
                    if (!SearchEngineManager.checkEngine(engine, false) && !illegal.includes(engine)) {
                        illegal.push(engine);
                    };
                });
            });
            if (illegal.length > 0) {
                alertMessage('搜索引擎' + illegal.map(e => e.name).join(', ') + '部分配置不合法，请检查！');
                return true;
            } else {
                this_.startProfile.saveCustomSearchEngine();
                return buttonListener.apply(this);
            }
        }

        const customView = `<style> .material-icon { font-family: "material-icon"; } dl {display: grid; grid-template-columns: 1fr; grid-auto-rows: 32px; gap: 8px; align-items: center; padding: 0; margin: 0; } .icon { width: 20px; height: 20px; user-select: none; } dd { margin: 0; display: grid; grid-template-columns: 24px .4fr 1fr .8fr 24px; gap: 8px; align-items: center; } dt { opacity: .8; font-size: .8em; padding-top: 8px; } span.icon { width: 32px; height: 32px; font-size: 20px; line-height: 32px; border-radius: 4px; text-align: center; transition: ease-in-out .2s; } span.icon:hover { background: rgba(0 0 0 / .2); } .icon.block::before { content: "\\e14b" } .icon.remove::before { content: "\\e14c" } .icon.restore::before, .icon.add::before { content: "\\e145" } .hide-disabled .disabled { display: none; } .disabled { order: 1; } .disabled > * { opacity: .6; } .disabled > .icon.restore { opacity: 1 } dt { user-select: none; pointer: default; } .hide-disabled dt::before { content: "►"; } .show-disabled dt::before { content: "▼"; } </style> <div class="hide-disabled"> <dl> ${searchEngine} <dd class="add-item"> <img class="icon" src="${default_icon}"> <input type="text" placeholder="名称" class="name"><input type="text" placeholder="链接, 使用 &quot;%s&quot; 代替搜索词" class="url" value=""><input type="text" placeholder="首页" class="index" value=""><span class="icon material-icon add"></span></dd> <dt> 已禁用</dt> </dl> </div>`;
        const this_ = this;
        new AlertDialog()
            .setTitle('管理搜索引擎')
            .setView(customView)
            .setPositiveButton('确定', saveChanges)
            .setNegativeButton('关闭', cancelChanges)
            .setModal(true)
            .onShow((view) => {
                manageSearchEnginesDialog(view, this_);
            })
            .onClose(() => {
                this_.modifyActivatedSearchEngine();
            })
            .show();
    };
}