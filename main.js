let id = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return function id() {
    return 'id' + s4() + s4();
  };
})();

let create = function(title) {
  return {
    id: id(),
    title: title,
    achieved: false,
    done: false,
    added: new Date()
  }
};

let json = localStorage.getItem('todos');
let todos = json && JSON.parse(json) || [];

let renderItem = (function() {
  return function renderItem(todo, element) {
    let json = JSON.stringify(todo);
    if (element.json === json) {
      return;
    }
    element.id = todo.id;
    element.json = json;
    todo.done ? element.classList.add('checked') : element.classList.remove('checked');
    let checkbox = element.querySelector('input[type=checkbox]')
    console.log('checkbox', checkbox);
    checkbox.id = 'checkbox' + todo.id;
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', function(value) {
      todo.done = checkbox.checked;
      update(todos);
    });
    element.querySelector('label').htmlFor = checkbox.id;
    element.querySelector('input[type=checkbox]').checked = todo.done;
    element.querySelector('.title').innerHTML = todo.title;
    return element;
  };
})();

let render = (function() {
  let template;
  document.addEventListener('DOMContentLoaded', function() {
    template = document.querySelector('#list-item');
  });

  function cloneTemplate() {
    return document.importNode(template.content, true).querySelector('li');
  }

  return function(todos) {
    let list = document.querySelector('#todos');
    let json = JSON.stringify(todos);
    if (list.json === json) {
      return;
    }
    list.json = JSON.stringify(todos);
    todos.forEach(function(todo) {
      let element = list.querySelector('#' + todo.id);
      if (element) {
        renderItem(todo, element);
      } else {
        list.insertBefore(renderItem(todo, cloneTemplate()), list.firstChild);
      }
    });
    componentHandler.upgradeDom();
  };
})();

let update = (function() {
  return function update(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
    render(todos);
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  render(todos);
  let addButton = document.querySelector('#add');
  let todoTitleText = document.querySelector('#new-todo');
  addButton.addEventListener('click', function() {
    let title = todoTitleText.value.trim();
    if (title) {
      todos.push(create(title));
      update(todos);
      todoTitleText.value = '';
    }
  });
});
