var Sidebar = require('./modules/sidebar.js');

(function() {
    'use strict';

    var app = {
        init: function init() {
            new Sidebar();
        }
    }

    window.addEventListener('DOMContentLoaded', app.init);
    
})();