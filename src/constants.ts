export enum ERROR_MESSAGES {
    PROMISE_DEFAULTS = '[interface-forge] buildSync does not support Promise defaults',
    PROMISE_OVERRIDES = '[interface-forge] buildSync does not support Promise overrides',
    PROMISE_FACTORY = '[interface-forge] buildSync does not support factory functions returning Promises',
    PROMISE_VALUE = '[interface-forge] Promise value encountered during buildSync for key :key',
    MISSING_BUILD_ARGS = '[interface-forge] missing required build arguments: :missingArgs',
}
