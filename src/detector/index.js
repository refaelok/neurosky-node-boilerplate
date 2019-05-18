import actions from './detector.actions';
import {NeuroskyEvents} from '../neurosky/neurosky.config';

export default {
    [NeuroskyEvents.attention]: [

    ],
    [NeuroskyEvents.meditation]: [

    ],
    [NeuroskyEvents.blink]: [
        actions.INCREASE_COUNTER
    ],
    [NeuroskyEvents.eeg]: [

    ],
    [NeuroskyEvents.signal]: [

    ],
    [NeuroskyEvents.wave]: [

    ]
}

