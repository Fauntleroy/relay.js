import IRCFactory from 'irc-factory';
import ip from 'ip';
import uuid from 'node-uuid';
import pick from 'lodash/object/pick';

import message_types from '../constants/message_types.js';
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
            console.log( JSON.stringify( message, null, 4 ) );
            action_creators.receiveAny( message );
        });

        api.hookEvent( connection_id, 'registered', function(){
            client.irc.join('#relay.js');
            client.irc.join('#tksync');
        });

        api.hookEvent( connection_id, 'join', function( event ){
            var user = pick( event, 'nickname', 'username', 'hostname' );
            action_creators.receiveJoin( user, event.channel, connection_id );
        });

        api.hookEvent( connection_id, 'privmsg', function( event ){
            action_creators.receiveMessage( event.message, event.nickname, event.target, connection_id );
        });

        return Object.assign( {}, client_options, {
            id: connection_id
        });
    }
};

export default irc;