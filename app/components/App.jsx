import React from 'react';
import map from 'lodash/collection/map';

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
        var connections_jsx = map( this.state.connections, function( connection ){
            return <li>{JSON.stringify( connection, null, 4 )}</li>;
        });
        var channels_jsx = map( this.state.channels, function( channel ){
            return <li>{JSON.stringify( channel, null, 4 )}</li>;
        });
        var messages_jsx = this.state.messages.map( function( message ){
            return <li>{JSON.stringify( message, null, 4 )}</li>;
        });
        return (
            <div>
                <span>React is working</span>
                <div>
                    <h2>Connections</h2>
                    <ul>{connections_jsx}</ul>
                </div>
                <div>
                    <h2>Channels</h2>
                    <ul>{channels_jsx}</ul>
                </div>
                <div>
                    <h2>Messages</h2>
                    <ul>{messages_jsx}</ul>
                </div>
            </div>
        );
    },
    _onStoreChange: function(){
        this.setState( store.getState() );
    }
});

export default App;