import action_types from '../constants/action_types.js';
import message_types from '../constants/message_types.js';
import connectionsReducer from './connections.js';

const initial_state = {};

var channelsReducer = function( state = initial_state, action ){
    switch( action.type ){
        case action_types.IRC_RECEIVE_JOIN:
            var channel_key = action.connection_id +'_'+ action.channel;
            var channels = Object.assign( {}, state, {
                [channel_key]: {
                    name: action.channel,
                    messages: [{
                        type: message_types.JOIN,
                        user: action.user
                    }]
                }
            } );
            return channels;
        break;
        case action_types.IRC_RECEIVE_MESSAGE:
            var channel_key = action.connection_id +'_'+ action.destination;
            var channels = Object.assign( {}, state );
            var channel = channels[channel_key];
            var message = {
                type: message_types.MESSAGE,
                user: action.origin,
                text: action.text
            };
            channel.messages = [ message, ...channel.messages ];
            return channels;
        break;
        default:
            return state;
    }
};

export default channelsReducer;