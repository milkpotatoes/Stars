/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

import { ShortcutCollections } from "./utils/data.js";
import { AlertDialog } from "./utils/alertdialog.js";
import { fileToBase64 } from "./utils/utils.js";
import { Shortcut } from "./utils/data.js";
import { showMessage } from "./utils/utils.js";

export class CustomShortcutsCollection extends ShortcutCollections {
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
                    desc: link.desc,
                    type: link.type ?? Shortcut.SHORTCUT_TYPE_SHORTCUT,
                });
            }
        };
        this.saveLinks();
        this.setEnevtListener();
    };
    refreshPageIndicator(pages = this.pagesCount) {
        const pagesIndicator = this._elm.querySelector('.pages-indicator');
        const indicators = pagesIndicator.querySelectorAll('.page-indicator');
        indicators.forEach(element => {
            element.remove();
        });
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
                type: link.type,
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
    editAddDialog(onsuccess = undefined, { name = '', url = '', icon = undefined, desc = '', type = Shortcut.SHORTCUT_TYPE_SHORTCUT } = {}) {
        const customView = `<style>.main-view{display:grid;grid-template-columns:76px 1fr;grid-template-rows:repeat(3, 32px);grid-template-areas:"i n" "i u" "w d";gap: 12px;align-items:center}
.icon{grid-area:i;width:76px;height:76px;background:rgba(0 0 0 / .1);object-fit:contain;border-radius:8px;padding:8px;box-sizing:border-box}label{grid-area: w;text-align:center}input[type=checkbox]{vertical-align: text-top}</style> 
<div class="main-view"> <img class="icon" src="src/image_FILL0_wght400_GRAD0_opsz24.svg"> 
<input type="file" style="display: none;" class="icon" accept="image/*"> 
<input type="text" placeholder="名称" class="name">
<input type="text" placeholder="链接" class="url">
<input type="text" placeholder="描述" class="desc">
<label><input type="checkbox" class="iswidget" id="iswidget">小部件</label>
</div>`;
        const collection = this;
        const dialog = new AlertDialog()
            .setTitle(name === '' ? '添加' : '修改')
            .setView(customView)
            .setPositiveButton('确定', function () {
                const _name = this.querySelector("input.name").value;
                const _icon = this.querySelector("img.icon").src;
                const _url = this.querySelector("input.url").value;
                const _desc = this.querySelector("input.desc").value;
                const _type = this.querySelector("input.iswidget").checked ? Shortcut.SHORTCUT_TYPE_WIDGET : Shortcut.SHORTCUT_TYPE_SHORTCUT;
                if (_name === '') {
                    showMessage('名称不能为空')
                } else if (_url === '') {
                    showMessage('链接不能为空')
                } else {
                    try {
                        new URL(_url);
                        if (typeof onsuccess === 'function') {
                            onsuccess(_name, _url, _icon, _desc, _type);
                        }
                        collection.saveLinks();
                        this.close();
                    } catch {
                        showMessage('链接格式错误');
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
                        showMessage('获取失败，请手动选择图标');
                        icon.src = prev_icon;
                        icon.onerror = undefined;
                    };
                    icon.src = url1;
                } catch {
                    showMessage('请输入正确的链接后再试');
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
        dialog.querySelector('.iswidget').checked = type === Shortcut.SHORTCUT_TYPE_WIDGET;
        preview.addEventListener('click', () => {
            file_select.click();
        });
        file_select.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                fileToBase64(files[0])
                    .then(base64 => {
                        preview.src = base64;
                    });
            }
        });
    };
    edit(id) {
        const link = this.at(id);
        this.editAddDialog((name, url, icon, desc, type) => {
            link.name = name;
            link.url = url;
            link.icon = icon;
            link.desc = desc;
            link.type = type;
        }, link);
    };
    userAdd() {
        this.editAddDialog((name, url, icon, desc, type) => {
            this.add({
                name: name,
                url: url,
                icon: icon,
                desc: desc,
                type: type,
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
    };
    filter(key = '') {
        if (key === '') {
            this._shortcutCollections.forEach(e => {
                e.elm.style.display = '';
                e.elm.style.opacity = '';
                e.elm.style.order = '';
            });
            this.refreshPageIndicator();
        } else {
            const searchKey = new RegExp(key.split('').join('(.+?)?'), 'g');
            let result_count = 0;
            this._shortcutCollections.forEach(e => {
                if (e._name.match(searchKey) !== null ||
                    e.url.match(key) !== null ||
                    e._desc.match(searchKey) !== null
                ) {
                    result_count++;
                    e.elm.style.display = '';
                    e.elm.style.opacity = 1;
                    e.elm.style.order = 0;
                } else {
                    e.elm.style.display = 'none';
                    e.elm.style.opacity = '';
                    e.elm.style.order = '';
                };
                this.refreshPageIndicator(Math.ceil(result_count / CustomShortcutsCollection.PAGE_SIZE));
            });
        };
    };
    stretching() {
        this._elm.style.transition = 'ease-in-out .2s';
        this._elm.style.marginBottom = '20px';
        this._elm.style.padding = '34px 24px';
        return setTimeout(() => {
            this._elm.style.marginBottom = '';
            this._elm.style.padding = '';
            setTimeout(() => {
                this._elm.style.transition = '';
            }, 200);
        }, 200);
    };

    setEnevtListener() {
        this._elm.addEventListener('dragover', e => {
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

        this._elm.addEventListener('drop', e => {
            const draggingElement = document.querySelector('.shortcut.dragging');

            let old_id = 0;
            let new_id = 0;
            for (let i = 0; i < this.size(); i++) {
                if (this.at(i) === draggingElement.data) {
                    old_id = i;
                    break;
                }
            }

            for (let i = 1; i < this._elm.children.length; i++) {
                if (this._elm.children[i] === draggingElement) {
                    new_id = i - 1;
                    break;
                }
            }

            this._shortcutCollections.splice(new_id, 0, this._shortcutCollections.splice(old_id, 1)[0]);
            this.saveLinks();
            e.preventDefault();
        });
    };
    removeTransition() {
        this._elm.style.transition = '';
    }
}