import React from 'react';

import action_creators from '../action_creators/irc.js';
import store from '../stores/irc.js';

var App = React.createClass({
    getInitialState: function(){
        return store.getState();
    },
    componentWillMount: function(){
        this._unsubscribe = store.subscribe( this._onStoreChange );
        action_creators.createConnection({
            nick: 'relayjs_app_test',
            server: 'irc.freenode.net'
        });
    },
    componentWillUnmount: function() {
        this._unsubscribe();
    },
    render: function(){
        var messages_jsx = this.state.messages.map( function( message ){
            return (
                <li>{JSON.stringify( message, null, 4 )}</li>
            );
        });
        return (
            <div>
                <span>React is working</span>
                <ul>{messages_jsx}</ul>
            </div>
        );
    },
    _onStoreChange: function(){
        this.setState( store.getState() );
    }
});

export default App;