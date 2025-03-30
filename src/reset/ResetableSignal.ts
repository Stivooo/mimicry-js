import {ResetSignal} from './ResetSignal';

export class ResetableSignal extends ResetSignal {
    constructor() {
        super();
    }

    reset() {
        for (const handler of this._listeners.keys()) {
            handler();
        }
    }

    get listenersCount() {
        return this._listeners.size;
    }
}
