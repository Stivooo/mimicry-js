import {Mutable} from '../types';

export function makeMutable<T>(entity: T): Mutable<T> {
    return entity as Mutable<T>;
}
