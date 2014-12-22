'use strict';

var CONFIG = {
    database : 'offline',
    remote   : 'http://127.0.0.1:5984/'
}

var App = function (database, remote) {
    this.local = new PouchDB(database);
    this.remote = new PouchDB(remote + database);
    this.template
        = '<li data-id="{{id}}">'
        +   '<div class="view">'
        +       '<label>{{title}}</label>'
        +       '<button class="destroy" onclick="app.remove({{id}})"></button>'
        +   '</div>'
        + '</li>' ;
    this.sync();
    this.fetch();
}

App.prototype.sync = function () {
    var that = this;
    this.local.sync(this.remote, { live : true })
        .on('change', function (change) {
            that.fetch();
        })
        .on('error', function (change) {
            console.log('Error during sync.');
        }); 
}

App.prototype.create = function (doc) {
    var that = this;
    if (!doc) return;
    doc._id = new Date().getTime().toString();
    this.local.put(doc, function (err, res) {
        if (err) throw err;
        if (res && res.ok) {
            that.fetch();
        }
    });
}

App.prototype.remove = function (id) {
    var that = this;
    this.local.get(id.toString(), function (err, doc) {
        if (err) throw err;
        that.local.remove(doc, function (err, res) {
            if (err) throw err;
            that.fetch();
        });
    });
}

App.prototype.fetch = function () {
    var that = this;
    this.local.allDocs({ include_docs : true }, function (err, res) {
        if (err) throw err;
        that.print(res.rows);
    });
}

App.prototype.print = function (items) {
    var that = this;
    var ul = document.querySelector('#todo-list');
    var docs = [];
    Array.prototype.map.call(items, function (item) {
        docs.push(that.render(item.doc));
    });
    ul.innerHTML = docs.join('');
}

App.prototype.erase = function (selector) {
    while (selector.hasChildNodes()) {
        selector.removeChild(selector.firstChild);
    }
}

App.prototype.render = function (doc) {
    var that = this;
    var template = that.template;
    template = template.replace('{{id}}', doc._id);
    template = template.replace('{{id}}', doc._id);
    template = template.replace('{{title}}', doc.title);
    return template;    
}

/*
*   @ View
*/
var app = new App(CONFIG.database, CONFIG.remote);

var form = document.getElementById('todo-form');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = form.querySelector('input');
    app.create({ title : inp.value });
    inp.value = '';
});
