export enum ERROR_MESSAGES {
    FILE_READ = '[interface-forge] error reading file :filePath\n\n:fileError',
    FILE_WRITE = '[interface-forge] error writing file :filePath\n\n:fileError',
    INVALID_EXTENSION = '[interface-forge] file extension is not supported :fileExtension',
    MISSING_BUILD_ARGS = '[interface-forge] missing required build arguments: :missingArgs',
    MISSING_DERIVED_PARAMETERS = '[interface-forge] missing derived parameters: :missingValues',
    MISSING_FILENAME = '[interface-forge] missing filename',
    PATH_IS_NOT_ABSOLUTE = '[interface-forge] fixture file path is not absolute',
    PROMISE_DEFAULTS = '[interface-forge] buildSync does not support Promise defaults',
    PROMISE_FACTORY = '[interface-forge] buildSync does not support factory functions returning Promises',
    PROMISE_OVERRIDES = '[interface-forge] buildSync does not support Promise overrides',
    PROMISE_VALUE = '[interface-forge] Promise value encountered during buildSync for key :key',
}
