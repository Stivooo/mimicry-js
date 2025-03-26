export function extractInitialParameters<InitialParameters extends any[] | never[]>(
    value?: InitialParameters,
): InitialParameters {
    if (Array.isArray(value)) {
        return value;
    }
    return [] as InitialParameters;
}
