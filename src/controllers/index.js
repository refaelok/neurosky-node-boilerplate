import DisplayCounter from './display-counter';

const controllersToConnect = [
    DisplayCounter
];

export default {
    connect: () => {
        // connect the controllers
        for (const controller of controllersToConnect) {
            if (typeof controller === "function") {
                const controllerInstance = new controller(store.getState());
                if (controllerInstance.onNewState) {
                    store.subscribe(() => controllerInstance.onNewState(store.getState()));
                }
            }
        }
    }
}

