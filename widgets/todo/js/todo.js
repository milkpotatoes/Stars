import { todoFormatter } from "./utils.js";

class TodoList extends HTMLElement {
    constructor() {
        super();
        const addBtn = document.createElement('div');
        addBtn.classList.add('new-item', 'material-icon');
        addBtn.textContent = 'add';
        super.append(addBtn);
        const emptyList = document.createElement('div');
        emptyList.classList.add('empty-list');
        emptyList.innerHTML = '<span class="material-icon">wysiwyg</span><span>暂无待办事项</span>';
        super.append(emptyList);
        this.setListener();
    }
    append(item) {
        this.children[1].style.display = 'none';
        let todoItem;
        if (item instanceof TodoItem) {
            todoItem = item;
        } else if (item instanceof Object && 'name' in item) {
            todoItem = new TodoItem(item.name, item.checked, item.time);
        } else {
            todoItem = new TodoItem(item);
        }
        super.append(todoItem);
        return todoItem;
    }
    setData(data) {
        this.querySelectorAll('todo-item').forEach(e => e.remove());
        this.children[1].style.display = '';
        const laterAppend = [];
        let j = 0;
        for (let i = 0; i < data.length; i++) {
            const item = this.append(data[i]);
            if (data[i].checked) {
                laterAppend.push(item);
                j--;
            }
            item.style.transform = `translate(0, ${item.clientHeight * j}px)`;
            j++;
        }
        for (let i = 0; i < laterAppend.length; i++) {
            const item = laterAppend[i];
            item.style.transform = `translate(0, ${item.clientHeight * j}px)`;
            j++;
        }
        if (data.length > 0) {
            this.children[1].style.display = 'none';
        }
    }
    sortElement() {
        const siblings = this.querySelectorAll('todo-item');
        if (siblings.length === 0) {
            return;
        }
        const copyArr = [];
        for (let i = 0; i < siblings.length; i++) {
            copyArr.push(siblings[i]);
        }
        copyArr.sort((a, b) => {
            return a.checked - b.checked;
        });
        const itemHeight = copyArr[0].clientHeight;
        for (let i = 0; i < copyArr.length; i++) {
            const item = copyArr[i];
            const style = `translate(0, ${i * itemHeight}px)`;
            item.animate([
                {
                    transform: item.style.transform,
                }, {
                    transform: style,
                }
            ], {
                easing: 'ease-in-out',
                duration: 200,
            });
            item.style.transform = style;
        }
    }
    setListener() {
        this.firstElementChild.addEventListener('click', () => {
            const firstElm = this.children[1];
            this.children[1].style.display = 'none';
            if (!firstElm.nextElementSibling || firstElm.nextElementSibling.name !== '') {
                const newItem = new TodoItem('');
                firstElm.after(newItem);
                newItem.children[1].focus();
                this.sortElement();
            } else {
                firstElm.nextElementSibling.children[1].focus();
            }
        });
        this.addEventListener('change', (e) => {
            const elem = e.target;
            if (e.target.type === 'checkbox') {
                this.sortElement();
            }
            this.saveData();
        });
        this.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete')) {
                this.sortElement();
                this.saveData();
            }
        });
    }
    saveData() {
        const data = [];
        let item = this.children[1].nextElementSibling;
        this.children[1].style.display = '';
        while (item) {
            this.children[1].style.display = 'none';
            if (item.name !== '') {
                data.push({
                    name: item.name,
                    checked: item.checked,
                    time: item.time,
                });
            }
            item = item.nextElementSibling;
        }
        localStorage.TODO_LIST_DATA = JSON.stringify(data);
    }
}

class TodoItem extends HTMLElement {
    checkBox = null;
    viewer = null;
    input = null;
    delBtn = null;
    get name() {
        return this.children[1].value;
    };
    set name(name) {
        this.children[1].value = name;
    };
    get checked() {
        return this.children[0].checked;
    };
    set checked(checked) {
        this.children[0].checked = checked;
    };
    time = null;
    constructor(name, checked = false, time = new Date().getTime()) {
        super();
        this.time = time;

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.checked = checked;
        this.checkBox = checkBox;
        const viewer = document.createElement('span');
        viewer.classList.add('viewer');
        viewer.innerHTML = todoFormatter(name);
        this.viewer = viewer;
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '添加...';
        input.value = name;
        this.input = input;
        const delBtn = document.createElement('span');
        delBtn.classList.add('material-icon', 'delete');
        delBtn.textContent = 'close';
        this.delBtn = delBtn;
        this.append(checkBox);
        this.append(input);
        this.append(viewer);
        this.append(delBtn);
        this.style.order = checked ? 1 : 0;
        this.setListener();
        this.showEditor(false);
    };
    showEditor(show = false) {
        if (show || this.name === '') {
            this.viewer.style.display = 'none';
            this.input.style.display = '';
        } else {
            this.viewer.style.display = '';
            this.input.style.display = 'none';
        }
    }
    setListener() {
        this.checkBox.addEventListener('change', () => {
            if (this.name === '') {
                this.checked = false;
            };
        });
        this.input.addEventListener('blur', () => {
            this.viewer.innerHTML = todoFormatter(this.input.value);
            this.showEditor(false);
        });
        this.viewer.addEventListener('click', e => {
            if(!(e.target instanceof HTMLAnchorElement)) {
                console.log(this)
                this.showEditor(true);
                this.input.focus();
            }
            console.log(e.target)
        });
        this.delBtn.addEventListener('click', () => {
            super.remove();
        }, { once: true });
    }
}

customElements.define('todo-list', TodoList);
customElements.define('todo-item', TodoItem);

const datas = JSON.parse(localStorage.TODO_LIST_DATA ?? '[]');

const todoList = document.querySelector('todo-list');
todoList.setData(datas);

window.addEventListener('storage', () => {
    const datas = JSON.parse(localStorage.TODO_LIST_DATA ?? '[]');
    todoList.setData(datas);
});