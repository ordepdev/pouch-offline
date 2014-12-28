'use strict';

var CONFIG = {
    host     : '127.0.0.1',
    port     : '5984',
    database : 'offline'
}

function App (config) {
    this.config = config || CONFIG;
    this.local = new PouchDB(this.config.database);
    this.remote = new PouchDB(this.parseCouchDB());
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

App.prototype.parseCouchDB = function () {
    return 'http://' 
        + this.config.host + ':' 
        + this.config.port + '/' 
        + this.config.database;
};

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
    var docs = '';
    Array.prototype.map.call(items, function (item) {
        docs += that.render(item.doc);
    });
    ul.innerHTML = docs;
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
var app = new App();

var form = document.getElementById('todo-form');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = form.querySelector('input');
    app.create({ title : inp.value });
    inp.value = '';
});
