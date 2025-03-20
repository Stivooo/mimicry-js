export function isClassInstance<InstanceType>(value: unknown): value is InstanceType & object {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const proto = Object.getPrototypeOf(value);
    return proto !== null && proto !== Object.prototype;
}
