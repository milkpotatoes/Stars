/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

class Widget {
    static ANIMATE_START_STATE = {
        boxShadow: '0 16px 16px rgba(0 0 0 / .25)',
        transform: 'scale(.2)',
        filter: 'opacity(0)'
    };
    static ANIMATE_END_STATE = {
        boxShadow: '0 16px 16px rgba(0 0 0 / .25)',
        transform: 'scale(1)',
        filter: 'opacity(1)'
    };
    static ANIMATE_OPTIONS = {
        duration: 300,
        iterations: 1,
        easing: 'ease-in-out',
    };
    static WIDGET_STATUS_HIDDEN = 0;
    static WIDGET_STATUS_HIDDING = 1;
    static WIDGET_STATUS_SHOWN = 2;
    static WIDGET_STATUS_SHOWING = 3;


    static setDragEvent(ele, func, finish) {
        let dragging = false;
        let autoCancelDrag = 0;
        ele.addEventListener('mousedown', (downE) => {
            dragging = true;
            const { clientX: sx, clientY: sy } = downE;
            const dragListener = (event) => {
                clearTimeout(autoCancelDrag);
                if (dragging) {
                    const { clientX: x, clientY: y } = event;
                    func(x, y, sx, sy);
                }

                autoCancelDrag = setTimeout(() => {
                    dragging = false;
                }, 3000);
            };
            document.addEventListener('mousemove', dragListener);
            document.addEventListener('mouseup', (event) => {
                if (typeof finish === 'function') {
                    const { clientX: x, clientY: y } = event;
                    finish(x, y, sx, sy);
                }

                document.removeEventListener('mousemove', dragListener);
                dragging = false;
            }, { once: true });
        });
    }
    root = document.createElement('div');
    elem = document.createElement('iframe');
    pinBtn;
    name;
    url;
    status = Widget.WIDGET_STATUS_HIDDEN;
    icoPos = {
        x: null,
        y: null,
    }
    pos = {
        x: null,
        y: null,
    }
    size = {
        w: 0,
        h: 0,
    }
    set width(w) {
        this.size.w = w;
        this.elem.style.width = w + 'px';
        this.root.style.width = w + 'px';
    };
    get width() {
        return this.size.w;
    }
    set height(h) {
        this.size.h = h;
        this.elem.style.height = h + 'px';
        this.root.style.height = h + 'px';
    };
    get height() {
        return this.size.h;
    }
    set pined(pin) {
        if (pin) {
            this.pinBtn.classList.remove('pin');
            this.pinBtn.classList.add('unpin');
        } else {
            this.pinBtn.classList.remove('unpin');
            this.pinBtn.classList.add('pin');
        }
    }
    get pined() {
        return this.pinBtn.classList.contains('unpin');
    }
    autoClose = (e) => {
        if (!this.root.contains(e.target) && !this.pined) {
            this.hide();
        }
    }
    constructor(name, url, w, h) {
        this.name = name;
        this.url = url;
        this.root.classList.add('widget');

        const actionBar = document.createElement('div');
        actionBar.classList.add('action');
        actionBar.innerHTML = `<div class="movable title"></div><span class="material-icon open-in-new">open_in_new</span><span class="material-icon pin"></span><span class="material-icon close">close</span>`;
        const closeButton = actionBar.querySelector('.close');
        const pinButton = actionBar.querySelector('.pin');
        const openInNewBtn = actionBar.querySelector('.open-in-new');
        this.pinBtn = pinButton;
        this.action = actionBar;
        this.root.append(actionBar);
        this.root.append(this.elem);

        const resizable = document.createElement('span');
        resizable.classList.add('resizable');
        const movable = actionBar.querySelector('.movable');
        movable.textContent = this.name;
        this.root.append(resizable);

        closeButton.addEventListener('click', this.hide.bind(this));
        pinButton.addEventListener('click', function () {
            this.pined = !this.pined;
        }.bind(this));
        openInNewBtn.addEventListener('click', (e) => {
            const radio = window.devicePixelRatio;
            this.popup(this.pos.x * radio + e.screenX - e.clientX * radio,
                this.pos.y * radio + e.screenY - e.clientY * radio);
            this.hide();
            this.destory();
        });
        this.width = w;
        this.height = h;
        Widget.setDragEvent(resizable, (x, y) => {
            this.width = Math.max(96, x - this.pos.x);
            this.height = Math.max(96, y - this.pos.y);
        });
        Widget.setDragEvent(movable, (x, y, sx, sy) => {
            this.root.style.left = (this.pos.x + x - sx) + 'px';
            this.root.style.top = (this.pos.y + y - sy) + 'px';
        }, (x, y, sx, sy) => {
            this.pos.x += x - sx;
            this.pos.y += y - sy;
            this.pos.x = Math.max(0, Math.min(document.body.clientWidth - this.width, this.pos.x));
            this.pos.y = Math.max(0, Math.min(document.body.clientHeight - this.height, this.pos.y));
            this.root.style.left = this.pos.x + 'px';
            this.root.style.top = this.pos.y + 'px';
        });
    }
    popup(x, y) {
        window.open(this.url, '_blank', `width=${this.width * window.devicePixelRatio},height=${this.height *
            window.devicePixelRatio},left=${x},top=${y},popup,noopener`);
    }
    show(x, y) {
        if (this.status !== Widget.WIDGET_STATUS_HIDDEN) {
            return;
        }
        document.removeEventListener('click', this.autoClose);
        this.status = Widget.WIDGET_STATUS_SHOWING;
        const { w, h } = this.size;
        if (this.elem.src === '') {
            this.elem.src = this.url;
            document.body.append(this.root);
        }
        x -= w / 2;
        y -= h / 2;
        x = Math.max(0, Math.min(document.body.clientWidth - w, x));
        y = Math.max(0, Math.min(document.body.clientHeight - h, y));

        this.pos.x = this.pos.x ?? x;
        this.pos.y = this.pos.y ?? y;
        this.icoPos.x = x;
        this.icoPos.y = y;
        this.root.style.top = this.pos.y + 'px';
        this.root.style.left = this.pos.x + 'px';
        this.root.style.filter = 'opacity(1)';
        this.root.animate([
            {
                left: x + 'px',
                top: y + 'px',
            },
            {
                left: this.pos.x + 'px',
                top: this.pos.y + 'px',
            },
        ], Widget.ANIMATE_OPTIONS);
        this.root.animate([Widget.ANIMATE_START_STATE, Widget.ANIMATE_END_STATE], Widget.ANIMATE_OPTIONS);

        setTimeout(() => {
            this.status = Widget.WIDGET_STATUS_SHOWN;
            document.addEventListener('click', this.autoClose);
        }, 500);
    }
    hide() {
        if (this.status !== Widget.WIDGET_STATUS_SHOWN) {
            return;
        }
        document.removeEventListener('click', this.autoClose);
        this.status = Widget.WIDGET_STATUS_HIDDING;
        this.root.style.filter = Widget.ANIMATE_START_STATE.filter;
        this.root.animate([Widget.ANIMATE_END_STATE, Widget.ANIMATE_START_STATE], Widget.ANIMATE_OPTIONS);
        this.root.animate([
            {
                left: this.pos.x + 'px',
                top: this.pos.y + 'px',
            },
            {
                left: this.icoPos.x + 'px',
                top: this.icoPos.y + 'px',
            },
        ], Widget.ANIMATE_OPTIONS);
        setTimeout(() => {
            this.status = Widget.WIDGET_STATUS_HIDDEN;
            this.root.style.top = '200%';
        }, Widget.ANIMATE_OPTIONS.duration);
        this.pined = false;
    }
    resize(w, h) {
        this.width = w;
        this.height = h;
    }
    setUrl(url) {
        if (this.elem.src !== '') {
            this.elem.src = url;
        }
        this.url = url;
    }
    destory() {
        this.root.remove();
        this.elem.removeAttribute('src')
    }
}
