import Cylon from'cylon';
import {NeuroskyEvents, port} from './neurosky.config';
import detectors from '../detector';
import algoActions from '../detector/algo-actions';

const results = {};
const executeActions = (results, event) => {
    for (const actionName of detectors[event]) {
        const actionFunc = algoActions[actionName];

        if (actionFunc(results, event)) {
            store.dispatch({type: actionName, payload: {results, event}});
        }
    }
};

setInterval(() => {
    executeActions({blink: 250}, 'blink');
}, 1000);


export default Cylon.robot({
    connections: {
        neurosky: { adaptor: 'neurosky-master', port }
    },

    devices: {
        headset: { driver: 'neurosky-master' }
    },

    work: function(my) {
        for (const event in NeuroskyEvents) {
            my.headset.on(event, (data) => {
                results.attention = data;
                executeActions(results, event); // to run the algorithms and dispatch accordinly
            });
        }
    }
});