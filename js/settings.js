/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

import { AlertDialog } from "./utils/alertdialog.js";
import { STATIC_SOURCE } from "./resource.js";
import { getPrimaryColor, fileToBase64 } from "./utils/utils.js";
import WallpaperEffect from "./utils/effect.js";
import LargeStorage from "./utils/largeStorage.js";

class WallpaperConfig {
    origin;
    target;
    effect;
    constructor(origin, target = origin, effect = WallpaperEffect.EFFECT_NONE) {
        this.origin = origin;
        this.target = target;
        this.effect = effect;
    }
}

export class Settings {
    static WALLPAPER_STORAGE_KEY = 'CURRENT_WALLPAPTER';
    static _cache_wallpaper = null;
    static _current_wallpaper = null;
    static async setWallpaper() {
        const wallpaperView = document.createElement('div');
        const fileChooser = document.createElement('input');
        fileChooser.type = 'file';
        fileChooser.accept = 'image/*';
        fileChooser.style.marginBottom = '.5em';
        wallpaperView.append(fileChooser);

        const wallpaperEffect = new WallpaperEffect();
        let wallpaperOrigin;
        wallpaperView.append(wallpaperEffect.canvas);
        const effectChooser = document.createElement('div');
        wallpaperView.append(effectChooser);
        const wallpaperConfig = await this.currentWallpaper;
        const originUrl = await this.getOriginWallaper();

        const radioBox = document.createElement('fieldset');
        wallpaperView.append(radioBox)
        const legend = document.createElement('legend');
        radioBox.append(legend);
        legend.textContent = '特效';
        const effectZHName = {
            EFFECT_NONE: '无',
            EFFECT_EPISTEMOLOGY: '长虹玻璃',
        }
        for (let effect in WallpaperEffect.SUPPORTED_EFFECT) {
            const name = WallpaperEffect.SUPPORTED_EFFECT[effect];
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'effect';
            radio.value = name;
            radio.id = name;
            const label = document.createElement('label');
            label.setAttribute('for', name);
            label.textContent = effect in effectZHName ? effectZHName[effect] : name;
            radioBox.append(radio, label);
            radio.checked = name === wallpaperConfig.effect || name === WallpaperEffect.EFFECT_NONE;
        }
        const fileListener = async e => {
            const files = e.target.files;
            if (files.length > 0) {
                const base64 = await fileToBase64(files[0]);
                const effect = wallpaperEffect.effect;
                await wallpaperEffect.setSrc(base64);
                const blob = await wallpaperEffect.getTargetImg();
                wallpaperOrigin = blob;
                wallpaperEffect.applyEffect(effect);
            }
        }
        const effectListener = e => {
            if (e.target.checked) {
                wallpaperEffect.applyEffect(e.target.value);
            };
        }
        radioBox.addEventListener('change', effectListener);
        fileChooser.addEventListener('change', fileListener);
        const setWallpaperDialog = new AlertDialog()
            .setTitle('设置壁纸')
            .setView(wallpaperView)
            .setPositiveButton('确定', async function () {
                const wallpaper = await wallpaperEffect.getTargetImg();
                const newWallpaper = new WallpaperConfig(wallpaperOrigin, wallpaper,
                    wallpaperEffect.effect);
                Settings.currentWallpaper = newWallpaper;
                Settings.showWallapaer()
                this.close();
            })
            .setNegativeButton('取消')
            .setNeturalButton('恢复默认', () => {
                const defaultWallpaper = new WallpaperConfig(STATIC_SOURCE.WALLPAPER);
                this.currentWallpaper = defaultWallpaper;
                this.showWallapaer()
                return false;
            })
        setWallpaperDialog.onShow((view) => {
            setTimeout(async () => {
                wallpaperEffect.canvas.style.width = view.firstChild.clientWidth + "px";
                radioBox.style.left = legend.clientWidth + 'px';
            }, 100);
        });
        setWallpaperDialog.onClose(() => {
            URL.revokeObjectURL(originUrl);
            fileChooser.removeEventListener('change', fileListener);
            radioBox.removeEventListener('change', effectListener);
            setTimeout(() => {
                wallpaperEffect.finish();
            }, 300);
        });
        setWallpaperDialog.show();
        wallpaperEffect.setSrc(originUrl)
            .then(async () => {
                const blob = await wallpaperEffect.getTargetImg()
                wallpaperOrigin = blob;
                wallpaperEffect.applyEffect(wallpaperConfig.effect ?? WallpaperEffect.EFFECT_NONE);
            });

    }
    static set currentWallpaper(value) {
        URL.revokeObjectURL(this._chache_wallpaper);
        this._chache_wallpaper = null;
        this._current_wallpaper = value;
        LargeStorage.setData(this.WALLPAPER_STORAGE_KEY, value)
            .then(() => {
                this.showWallapaer()
            });
    }
    static get currentWallpaper() {
        return new Promise((resolve, reject) => {
            if (this._current_wallpaper) {
                resolve(this._current_wallpaper);
            } else {
                LargeStorage.getData(this.WALLPAPER_STORAGE_KEY)
                    .then(wallpaper => {
                        if (wallpaper && wallpaper.origin) {
                            if (!wallpaper.target) {
                                wallpaper.target = wallpaper.origin;
                            }
                            this._current_wallpaper = wallpaper;
                            resolve(wallpaper);
                        } else {
                            const conf = new WallpaperConfig(STATIC_SOURCE.WALLPAPER);
                            this._current_wallpaper = conf;
                            resolve(conf);
                        }
                    });
            }
        })
    }
    static resetDefaultWallpaper() {
        this.currentWallpaper = new WallpaperConfig(STATIC_SOURCE.WALLPAPER);
    }
    static async getOriginWallaper() {
        const curWallpaper = await this.currentWallpaper;
        console.log(curWallpaper)
        if (curWallpaper.origin instanceof Blob) {
            return URL.createObjectURL(curWallpaper.origin);
        } else {
            return curWallpaper.origin;
        }
    }
    static async getCurrentWallaper() {
        const curWallpaper = await this.currentWallpaper;
        if (this._chache_wallpaper) {
            return this._cache_wallpaper;
        } else {
            if (curWallpaper.target instanceof Blob) {
                this._cache_wallpaper = URL.createObjectURL(curWallpaper.target);
            } else {
                this._cache_wallpaper = curWallpaper.target;
            }
            return this._cache_wallpaper;
        }
    }
    static async showWallapaer(wallpaper) {
        if (!wallpaper) {
            wallpaper = await Settings.getCurrentWallaper();
        }
        document.querySelector('.wallpaper').style.backgroundImage = `url(${wallpaper})`;
        getPrimaryColor(wallpaper)
            .then(e => {
                document.documentElement.style.backgroundColor = `rgb(${e.r}, ${e.g}, ${e.b})`;
            });
    }
}