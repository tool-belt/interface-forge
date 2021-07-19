export enum ERROR_MESSAGES {
    FILE_READ = '[interface-forge] error reading file :filePath',
    FILE_WRITE = '[interface-forge] error writing file :filePath',
    INSUFFICIENT_PERMISSIONS = '[interface-forge] insufficient user permissions for given path :filePath',
    INVALID_EXTENSION = '[interface-forge] file extension is not supported :fileExtension',
    MISSING_BUILD_ARGS = '[interface-forge] missing required build arguments: :missingArgs',
    MISSING_FILENAME = '[interface-forge] missing filename',
    PATH_DOES_NOT_EXIST = '[interface-forge] path does not exist :filePath',
    PROMISE_DEFAULTS = '[interface-forge] buildSync does not support Promise defaults',
    PROMISE_FACTORY = '[interface-forge] buildSync does not support factory functions returning Promises',
    PROMISE_OVERRIDES = '[interface-forge] buildSync does not support Promise overrides',
    PROMISE_VALUE = '[interface-forge] Promise value encountered during buildSync for key :key',
}
