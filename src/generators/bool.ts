import {oneOf} from './oneOf';

export function bool() {
    return oneOf(true, false);
}
