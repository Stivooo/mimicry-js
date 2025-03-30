export class ResetSignal {
    protected _listeners = new Set<() => void>();

    protected constructor() {}

    listen(handler: () => void) {
        if (!this._listeners.has(handler)) {
            this._listeners.add(handler);
        }
    }
}
