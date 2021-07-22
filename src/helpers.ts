function iterableToArray<T>(iterable: Iterable<T>): T[] {
    const values: T[] = [];
    for (const value of iterable) {
        values.push(value);
    }
    return values;
}

export function iterate<T>(iterable: Iterable<T>): Generator<T, T, T> {
    const values = iterableToArray(iterable);
    return (function* () {
        let counter = 0;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            const value = values[counter];
            if (counter === values.length - 1) {
                counter = 0;
            } else {
                counter++;
            }
            yield value;
        }
    })();
}

export function sample<T>(iterable: Iterable<T>): Generator<T, T, T> {
    const values = iterableToArray(iterable);
    return (function* () {
        let lastValue = null;
        let newValue = null;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            if (values.length <= 1) {
                yield values[0];
            }
            lastValue = newValue;
            while (newValue === lastValue) {
                newValue = values[Math.floor(Math.random() * values.length)];
            }
            yield newValue;
        }
    })();
}
