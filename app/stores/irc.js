import { createStore } from 'redux';

import { IRC_RECEIVE_MESSAGE } from '../constants/action_types.js';

const initial_state = {
    messages: []
};

var stateReducer = function( state = initial_state, action ){
    switch( action.type ){
        case IRC_RECEIVE_MESSAGE:
            return Object.assign( {}, state, {
                messages: [ action.message, ...state.messages ]
            });
        break;
        default:
            return state;
    }
};

var store = createStore( stateReducer );

export default store;