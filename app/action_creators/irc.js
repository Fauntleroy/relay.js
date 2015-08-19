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
    receiveMessage: function( message ){
        return {
            type: action_types.IRC_RECEIVE_MESSAGE,
            message: message
        };
    }
};

export default bindActionCreators( action_creators, dispatch );