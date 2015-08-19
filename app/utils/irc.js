import IRCFactory from 'irc-factory';
import ip from 'ip';
import uuid from 'node-uuid';

import action_creators from '../action_creators/irc.js';

var api = new IRCFactory.Api();

var irc = {
    createConnection: function( options = {} ){
        var connection_id = uuid.v4();
        var default_options = {
            port: 6667,
            secure: false,
            user: ip.address(),
            realname: options.nick
        };
        var client_options = Object.assign( default_options, options );
        var client = api.createClient( connection_id, client_options );

        api.hookEvent( connection_id, '*', function( message ){
            console.log( message );
            action_creators.receiveMessage( message );
        });

        api.hookEvent( connection_id, 'registered', function( message ){
            client.irc.join('#relay.js');
        });

        return Object.assign( {}, client_options, {
            id: connection_id
        });
    }
};

export default irc;