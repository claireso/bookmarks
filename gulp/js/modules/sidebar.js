'use strict'

var debounce = require('../utils/debounce.js'),
    CLS = 'is-sidebar-open';

var Sidebar = function() {
    this.elements.el = document.querySelector('#js-menu');
    this.elements.body = document.querySelector('body');
    this.elements.app = document.querySelector('.app__main')

    this.bindEvents();
}

Sidebar.prototype.elements = {};

Sidebar.prototype.bindEvents = function bindEvents() {
    this.elements.el.addEventListener('click', this.toggle.bind(this));
    this.elements.app.addEventListener('click', this.close.bind(this))
    window.addEventListener('resize', debounce(this.close.bind(this)), 200)
};

Sidebar.prototype.toggle = function toggle() {
    this[ (this.elements.body.classList.contains(CLS)) ? 'close' : 'open' ]();
};

Sidebar.prototype.open = function open() {
    this.elements.body.classList.add(CLS);
};

Sidebar.prototype.close = function open() {
    this.elements.body.classList.remove(CLS);
};

//export
module.exports = Sidebar;