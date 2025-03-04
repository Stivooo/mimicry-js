export function map<InputObject extends object, Key extends keyof InputObject, ResultValue = any>(
    object: InputObject,
    callback: (key: Key, value: InputObject[Key], current: Readonly<{[key in Key]?: ResultValue}>) => ResultValue,
) {
    return (Object.keys(object) as Key[]).reduce(
        (total, key) => {
            total[key] = callback(key, object[key], total);
            return total;
        },
        {} as {[key in Key]: ResultValue},
    );
}
