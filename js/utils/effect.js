/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

import { fileToBase64 } from "./utils.js";

export default class WallpaperEffect {
    static EFFECT_NONE = 'none';
    static EFFECT_EPISTEMOLOGY = 'epistemology';
    static SUPPORTED_EFFECT = {
        EFFECT_NONE: this.EFFECT_NONE,
        EFFECT_EPISTEMOLOGY: this.EFFECT_EPISTEMOLOGY,
    }
    image = new Image(0, 0);
    canvas = document.createElement('canvas');
    ctx = this.canvas.getContext('2d');
    loaded = false;
    loadError = null;
    _effect = WallpaperEffect.EFFECT_NONE;
    get effect() {
        return this._effect;
    }
    constructor(img) {
        document.body.append(this.image);
        if (img) {
            this.setSrc(img)
                .catch(e => {
                    throw new Error('src load failed');
                })
        }
    }
    setSrc(img) {
        this.loaded = null;
        return new Promise((reslove, reject) => {
            this.image.onload = async () => {
                this.loaded = true;
                this.loadError = null;
                await this.resetCanvas();
                reslove('ok');
            }
            this.image.onerror = () => {
                reject('error');
            }
            if (typeof img === 'string') {
                this.image.src = img;
            } else {
                this.image.src = fileToBase64(img);
            }
        });
    }
    getTargetImg() {
        return new Promise((resolve, reject) => {
            if (this.loaded === true) {
                this.canvas.toBlob((res) => {
                    resolve(res);
                });
            } else {
                reject(new Error('please load src before apply effect'))
            }
        })
    }
    async resetCanvas() {
        this._effect = WallpaperEffect.EFFECT_NONE;
        const [img_w, img_h] = [this.image.naturalWidth, this.image.naturalHeight];
        const cav_h = 1440;
        const cav_w = img_w / img_h * 1440;
        this.canvas.height = cav_h;
        this.canvas.width = cav_w;
        this.ctx.drawImage(this.image, 0, 0, cav_w, cav_h);
        return;
    }
    async applyEffectEpistemology() {
        if (this.loaded === true) {
            this._effect = WallpaperEffect.EFFECT_EPISTEMOLOGY;
            const ctx = this.ctx;
            const [srcWidth, srcHeight] = [this.image.naturalWidth, this.image.naturalHeight];
            const [cavWidth, cavHeight] = [this.canvas.width, this.canvas.height];
            const parts = 26;
            const [srcBlock, ctxBlock] = [srcWidth / (parts + 1), cavWidth / parts];
            ctx.drawImage(this.image,
                0, 0, srcWidth, srcHeight,
                0, 0, cavWidth, cavHeight);
            for (let part = 0; part < parts; part++) {
                const drawS = ctxBlock * part;
                ctx.drawImage(this.image,
                    srcWidth / (parts + 1) * part, 0, srcBlock * 2, srcHeight,
                    drawS, 0, ctxBlock, cavHeight);
            }
            ctx.fillStyle = 'transparent'
            ctx.fillRect(0, 0, cavWidth, cavHeight);
            for (let part = 0; part < parts; part++) {
                const drawS = ctxBlock * part;
                const gradSize = ctxBlock * 0.5;
                ctx.filter = 'none';
                const grad = ctx.createLinearGradient(drawS - gradSize / 2, 0, drawS + gradSize, 0);
                const baseColor = '#000000';
                grad.addColorStop(0, baseColor + '00');
                grad.addColorStop(0.33, baseColor + '30');
                grad.addColorStop(1, baseColor + '00');
                ctx.fillStyle = grad;
                ctx.fillRect(drawS - gradSize / 2, 0, drawS + gradSize, cavHeight);
            }
            return;
        } else {
            throw new Error('please load src before apply effect');
        }
    }
    async applyEffect(effectName) {
        switch (effectName) {
            case WallpaperEffect.EFFECT_NONE:
                return this.resetCanvas();
            case WallpaperEffect.EFFECT_EPISTEMOLOGY:
                return this.applyEffectEpistemology();
            default:
                return;
        }
    }
    finish() {
        this.image.remove();
        this.canvas.remove();
    }
}