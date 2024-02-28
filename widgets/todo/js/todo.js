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
    }
    setData(data) {
        this.querySelectorAll('todo-item').forEach(e => e.remove());
        this.children[1].style.display = '';
        for (let i = 0; i < data.length; i++) {
            this.append(data[i]);
        }
        if (data.length > 0) {
            this.children[1].style.display = 'none';
        }
    }
    setListener() {
        this.addEventListener('mousewheel', (e) => {
            this.scrollBy(0, e.deltaY);
        });
        this.addEventListener('DOMMouseScroll', (e) => {
            this.scrollBy(0, e.deltaY * 50);
        });
        this.firstElementChild.addEventListener('click', () => {
            const firstElm = this.children[1];
            this.children[1].style.display = 'none';
            if (!firstElm.nextElementSibling || firstElm.nextElementSibling.name !== '') {
                const newItem = new TodoItem('');
                firstElm.after(newItem);
                newItem.children[1].focus();
            } else {
                firstElm.nextElementSibling.children[1].focus();
            }
        });
        this.addEventListener('change', () => {
            this.saveData();
        });
        this.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete')) {
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
        const text = document.createElement('input');
        text.type = 'text';
        text.placeholder = '添加...';
        text.value = name;
        const delBtn = document.createElement('span');
        delBtn.classList.add('material-icon', 'delete');
        delBtn.textContent = 'close';
        this.append(checkBox);
        this.append(text);
        this.append(delBtn);
        this.style.order = checked ? 1 : 0;
        this.setListener();
    };
    setListener() {
        this.children[0].addEventListener('change', (e) => {
            const parent = this.parentElement;
            let prevChecked = this;
            let prevUnchecked = this;
            do {
                prevChecked = prevChecked.previousElementSibling;
            } while (prevChecked !== null && !prevChecked.checked);
            do {
                prevUnchecked = prevUnchecked.previousElementSibling
            } while (prevUnchecked !== null && prevUnchecked.checked);
            if (prevChecked === null) {
                prevChecked = parent.lastElementChild;
                while (prevChecked !== this && prevChecked.checked) {
                    prevChecked = prevChecked.previousElementSibling;
                }
            }
            if (prevUnchecked == this) {
                prevUnchecked = this.previousElementSibling;
            }
            const amimateOptions = {
                easing: 'linear',
                duration: 200,
            };
            const animateStart = {
                transform: 'translate(0, 0)',
            };
            if (e.target.checked) {
                if (this.name === '') {
                    this.checked = false;
                    return;
                }
                this.animate([animateStart, {
                    transform: `translate(0, ${(prevChecked ?? this).offsetTop - this.offsetTop}px)`,
                }], amimateOptions);
                setTimeout(() => {
                    this.style.order = 1;
                }, amimateOptions.duration + 50);
            } else {
                this.animate([animateStart, {
                    transform: `translate(0, ${(prevChecked ?? this).offsetTop - this.offsetTop}px)`,
                }], amimateOptions);
                setTimeout(() => {
                    this.style.order = 0;
                }, amimateOptions.duration + 50);
            }
        });
        this.children[2].addEventListener('click', () => {
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