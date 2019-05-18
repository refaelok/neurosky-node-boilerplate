import { combineReducers, createStore } from 'redux'
import counterReducer from './counter-reducer';

export default {
    create: () => {
        const rootReducer = combineReducers({
            counterReducer
        });

        global.store = createStore(rootReducer);
    }
}
