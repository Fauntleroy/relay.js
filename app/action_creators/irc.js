import { bindActionCreators } from 'redux';

import action_types from '../constants/action_types.js';
import irc_utils from '../utils/irc.js';
import { dispatch } from '../stores/irc.js';

var action_creators = {
    createConnection: function( options ){
        var connection = irc_utils.createConnection( options );
        return {
            type: action_types.IRC_CREATE_CONNECTION,
            connection: connection
        };
    },
    receiveAny: function( message ){
        return {
            type: action_types.IRC_RECEIVE_ANY,
            message: message
        };
    },
    receiveJoin: function( user, channel, connection_id ){
        return {
            type: action_types.IRC_RECEIVE_JOIN,
            user: user,
            channel: channel,
            connection_id: connection_id
        };
    },
    receiveMessage: function( text, origin, destination, connection_id ){
        return {
            type: action_types.IRC_RECEIVE_MESSAGE,
            text: text,
            origin: origin,
            destination: destination,
            connection_id: connection_id
        };
    }
};

export default bindActionCreators( action_creators, dispatch );