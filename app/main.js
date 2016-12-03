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
    archived: false,
    done: false
  }
};

let json = localStorage.getItem('todos');
let todos = json && JSON.parse(json) || [];
let searchText = null;
let showingArchive = false;

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
    checkbox.id = 'checkbox' + todo.id;
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', function(value) {
      todo.done = checkbox.checked;
      update(todos);
    });
    let archive = element.querySelector('.archive');
    let unarchive = element.querySelector('.unarchive');
    if (todo.archived) {
      archive.classList.add('hide');
      unarchive.classList.remove('hide');
      unarchive.addEventListener('click', function(value) {
        todo.archived = false;
        refresh(todos);
      });
    } else {
      archive.classList.remove('hide');
      unarchive.classList.add('hide');
      archive.addEventListener('click', function(value) {
        todo.archived = true;
        refresh(todos);
      });
    }
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
      if (showingArchive !== todo.archived || searchText && todo.title.indexOf(searchText) === -1) {
        return;
      }
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

function update(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
  render(todos);
}

function refresh(todos) {
  let list = document.querySelector('#todos');
  localStorage.setItem('todos', JSON.stringify(todos));
  list.innerHTML = '';
  list.json = '';
  render(todos);
}

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

  let hideMenu = function() {
    document.querySelector('.mdl-layout__drawer').classList.remove('is-visible');
    document.querySelector('.mdl-layout__obfuscator').classList.remove('is-visible');
  };

  let showTodos = function() {
    showingArchive = false;
    refresh(todos);
    document.querySelector('#addField').classList.remove('hide');
  };

  let showArchives = function() {
    showingArchive = true;
    refresh(todos);
    document.querySelector('#addField').classList.add('hide');
  };

  document.querySelector('#showTodosButton').addEventListener('click', function() {
    showTodos();
    hideMenu();
  });

  document.querySelector('#showArchivesButton').addEventListener('click', function() {
    showArchives();
    hideMenu();
  });

  var dialog = document.querySelector('dialog');
  document.querySelector('#deleteAll').addEventListener('click', function() {
    dialog.showModal();
  });
  dialog.querySelector('.close').addEventListener('click', function() {
    dialog.close();
  });
  document.querySelector('#deleteOk').addEventListener('click', function() {
    console.log('deleteOk');
    dialog.close();
    hideMenu();
    todos = [];
    showTodos();
  });

  let text = document.querySelector('#searchText');
  searchText = text.value = '';
  let searcher = function() {
    if (searchText !== text.value) {
      searchText = text.value;
      refresh(todos);
    }
    setTimeout(searcher, 200);
  };
  searcher();
});
