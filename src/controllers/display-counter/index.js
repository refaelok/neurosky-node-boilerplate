export default class DisplayCounter {
    constructor(state) {
        console.log('state from controller constructor:', state);
    }

    onNewState(state) {
        this.displayCounter(state.counterReducer)
    }

    displayCounter(result) {
        console.log('state from controller method:', result);
    }
}

