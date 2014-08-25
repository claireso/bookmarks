/**
 * Transform a list into a select for mobile
 */

/**
 * Build the select before the list
 * @param  {[dom]} elem the dom list
 */
var buildSelect = function buildSelect(list) {
    var select = document.createElement('select'),
        items = [].slice.call(list.querySelectorAll('a')),
        html = [];

    html.push('<option value="/">Latests</option>');

    items.forEach(function(a) {
        var selected = a.parentNode.classList.contains('is-active');

        html.push('<option ' + ( selected ? 'selected' : '') + ' value="' + a.getAttribute('href') + '">' + a.textContent + '</option>');
    });

    select.innerHTML = html.join('');
    select.classList.add('mt-only');
    select.classList.add('filters');

    list.parentNode.insertBefore(select, list);

    return select;
};


/**
 * Public functions
 */
var filters = {

    init: function init() {
        var list = document.querySelector('ul.js-filters'),
            select = buildSelect( list );

        //attach events
        select.addEventListener('change', function(e){
            window.location = e.currentTarget.value;
        });
    }

};


//export
module.exports = filters;