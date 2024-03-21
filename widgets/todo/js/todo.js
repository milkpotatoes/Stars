import { todoFormatter } from "./utils.js";

const CLEAR_DATA_COMMAND = '> CLEARALLDATA!';

class TodoList extends HTMLElement {
    emptyList = null;
    addBtn = null;
    editor = null;
    constructor() {
        super();
        const addBtn = document.createElement('div');
        addBtn.classList.add('new-item', 'material-icon');
        addBtn.textContent = 'add';
        this.addBtn = addBtn;
        const emptyList = document.createElement('div');
        emptyList.classList.add('empty-list');
        emptyList.innerHTML = '<span class="material-icon">wysiwyg</span><span>暂无待办事项</span>';
        this.emptyList = emptyList;
        super.append(emptyList);
        super.append(addBtn);
        this.setListener();
    }
    append(item) {
        this.emptyList.style.display = 'none';
        let todoItem;
        if (item instanceof TodoItem) {
            todoItem = item;
        } else if (item instanceof Object && 'name' in item) {
            todoItem = new TodoItem(item.name, item.checked, item.time);
        } else {
            todoItem = new TodoItem(item);
        }
        super.append(todoItem);
        this.autoSortListener(todoItem);
        this.sortElement();
        return todoItem;
    }
    showEmpty() {
        if (!this.querySelector('todo-item')) {
            this.emptyList.style.display = '';
        } else {
            this.emptyList.style.display = 'none';
        }
    }
    setData(data) {
        this.querySelectorAll('todo-item').forEach(e => e.remove());
        this.emptyList.style.display = '';
        for (let i = 0; i < data.length; i++) {
            if (data[i].name) {
                this.append(data[i]);
            }
        }
        this.sortElement();
        this.showEmpty();
    }
    sortElement() {
        const siblings = this.querySelectorAll('todo-item');
        console.log(siblings)
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
        let tabIndex = 1;
        for (let i = 0; i < copyArr.length; i++) {
            const item = copyArr[i];
            item.checkBox.tabIndex = tabIndex++;
            item.querySelectorAll('a').forEach(a => {
                a.tabIndex = tabIndex++;
            });
            item.viewer.tabIndex = tabIndex++;
            item.input.tabIndex = tabIndex++;
            const style = `translate(0, ${i * itemHeight}px)`;
            if (item.style.transform !== '') {

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
            }
            item.style.transform = style;
        }
    }
    setListener() {
        const addTodoItem = () => {
            const newItem = new TodoItem('');
            this.autoSortListener(newItem);
            this.addBtn.after(newItem);
            newItem.input.focus();
            newItem.input.addEventListener('keydown', newItemListerer);
            newItem.input.addEventListener('blur', (e) => {
                e.target.removeEventListener('keydown', newItemListerer);
            }, { once: true });
            this.sortElement();
        }
        const newItemListerer = (e) => {
            if (e.key === 'Enter') {
                if (e.target.value === CLEAR_DATA_COMMAND) {
                    if (confirm('确定要清空所有数据? 该操作不可恢复')) {
                        setTimeout(() => {
                            localStorage.removeItem('TODO_LIST_DATA');
                            location.reload();
                        }, 50);
                        return;
                    }
                    e.target.removeEventListener('keydown', newItemListerer);
                    e.target.parentElement.remove();
                } else if (e.target.value !== '') {
                    addTodoItem();
                }
            } else if (e.key === 'Escape') {
                e.target.blur();
                this.sortElement();
            }
        }
        this.addBtn.addEventListener('click', () => {
            if (!this.addBtn.nextElementSibling || this.addBtn.nextElementSibling.name !== '') {
                addTodoItem();
            } else {
                this.addBtn.nextElementSibling.input.focus();
            }
            this.showEmpty();
        });
    }
    autoSortListener(elem) {
        const autoSaveSort = (e) => {
            console.log(e)
            this.sortElement();
            this.saveData();
            this.showEmpty();
        }
        elem.input.addEventListener('blur', autoSaveSort);
        elem.delBtn.addEventListener('click', autoSaveSort);
        elem.checkBox.addEventListener('change', autoSaveSort);
    }
    saveData() {
        const data = [];
        let item = this.emptyList.nextElementSibling;
        this.emptyList.style.display = '';
        while (item) {
            this.emptyList.style.display = 'none';
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
        return this.input.value;
    };
    set name(name) {
        this.input.value = name;
        this.viewer.innerHTML = todoFormatter(name);
        this.viewer.title = this.viewer.textContent;
    };
    get checked() {
        return this.checkBox.checked;
    };
    set checked(checked) {
        this.checkBox.checked = checked;
    };
    time = null;
    constructor(name, checked = false, time = new Date().getTime()) {
        super();
        this.time = time;

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.checked = checked;
        this.checkBox = checkBox;
        this.viewer = document.createElement('span');
        this.viewer.classList.add('viewer');
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = '添加...';
        this.name = name;
        const delBtn = document.createElement('span');
        delBtn.classList.add('material-icon', 'delete');
        delBtn.textContent = 'close';
        this.delBtn = delBtn;
        this.append(checkBox);
        this.append(this.input);
        this.append(this.viewer);
        this.append(delBtn);
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
            this.input.blur();
        }
    }
    setListener() {
        this.checkBox.addEventListener('change', () => {
            if (this.name === '') {
                this.checked = false;
            };
        });
        this.input.addEventListener('change', () => {
            this.name = this.name;
            this.showEditor(false);
        });
        this.input.addEventListener('blur', () => {
            this.showEditor(false);
            if (this.name === '') {
                this.input.blur();
                this.remove();
            }
        });
        this.viewer.addEventListener('focus', (e) => {
            if (!e.target.contains(e.explicitOriginalTarget)) {
                this.showEditor(true);
                this.input.focus();
            }
        });
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.name = this.name;
                this.showEditor(false);
                if (this.name === '') {
                    this.input.blur();
                    this.remove();
                }
            }
        });
        this.viewer.addEventListener('click', e => {
            if (!(e.target instanceof HTMLAnchorElement) && !e.altKey) {
                this.showEditor(true);
                this.input.focus();
            }
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

if (localStorage.TODO_LIST_DATA === undefined) {
    const FIRST_LOAD_NOTE = [
        '点击 <span style="background:#fa1;border-radius:50%;font-size:.8rem;' +
        'display:inline-flex;width:1rem;height:1em;justify-content:center;' +
        'padding:.1rem 0;color:#fff">{add}</span> 新建待办事项',
        '使用\\*\\*设置**粗体**\\*\\*',
        '使用\\*\\*\\*设置***斜体***\\*\\*\\*',
        '使用\\~\\~设置~~删除线~~\\~\\~',
        '使用\\[添加[链接](#)\\]\\(#\\)',
        '使用\\{check\}添加图标{check}',
        '使用\\\\防止符号被格式化',
    ];
    FIRST_LOAD_NOTE.forEach(name => todoList.append(name));
} else {
    todoList.setData(datas);
}

window.addEventListener('storage', () => {
    const datas = JSON.parse(localStorage.TODO_LIST_DATA ?? '[]');
    todoList.setData(datas);
});