export function map<InputObject extends object, Key extends keyof InputObject, ResultValue = any>(
    object: InputObject,
    callback: (value: InputObject[Key], key: Key, current: Readonly<{[key in Key]?: ResultValue}>) => ResultValue,
) {
    return (Object.keys(object) as Key[]).reduce(
        (total, key) => {
            total[key] = callback(object[key], key, total);
            return total;
        },
        {} as {[key in Key]: ResultValue},
    );
}
