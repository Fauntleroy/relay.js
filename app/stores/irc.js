import { createStore, combineReducers } from 'redux';

import connectionsReducer from './connections.js';
import channelsReducer from './channels.js';
import messagesReducer from './messages.js';

var reducer = combineReducers({
    connections: connectionsReducer,
    channels: channelsReducer,
    messages: messagesReducer
});
var store = createStore( reducer );

export default store;