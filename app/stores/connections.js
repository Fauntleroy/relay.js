import action_types from '../constants/action_types.js';

const initial_state = [];

var connectionsReducer = function( state = initial_state, action ){
    switch( action.type ){
        case action_types.IRC_CREATE_CONNECTION:
            var connection = Object.assign( {}, action.connection );
            return [ connection, ...state ];
        break;
        default:
            return state;
    }
};

export default connectionsReducer;