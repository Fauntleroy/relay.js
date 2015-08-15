var node_jsx = require('node-jsx');
var React = require('react');

node_jsx.install({
    extension: '.jsx'
});

var App = require('./components/App.jsx');

React.render( React.createElement( App, null ), document.body );