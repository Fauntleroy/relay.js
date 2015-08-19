import action_types from '../constants/action_types.js';

const initial_state = [];

var messagesReducer = function( state = initial_state, action ){
    switch( action.type ){
        case action_types.IRC_RECEIVE_MESSAGE:
            var message = action.message;
            return [ message, ...state ];
        break;
        default:
            return state;
    }
};

export default messagesReducer;