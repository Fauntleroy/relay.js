import IRCFactory from 'irc-factory';

import action_creators from '../action_creators/irc.js';

var api = new IRCFactory.Api();

var irc = {
    createConnection: function( options ){
        var client = api.createClient('test', {
            nick: 'relayjs_test',
            user: 'relayjs_test_user',
            server: 'irc.freenode.net',
            realname: 'relayjs_test_name',
            port: 6667,
            secure: false
        });

        api.hookEvent('test', '*', function( message ){
            console.log( message );
            action_creators.receiveMessage( message );
        });

        api.hookEvent('test', 'registered', function( message ){
            client.irc.join('#relay.js');
        });
    }
};

export default irc;