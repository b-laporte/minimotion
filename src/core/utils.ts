
let LOG_ACTIVE = false;

export function log(...args: any[]) {
    if (LOG_ACTIVE) {
        console.log.apply(console, args);
    }
}

export function activateLogs() {
    LOG_ACTIVE = true;
}

export function deactivateLogs() {
    LOG_ACTIVE = false;
}

export function parseValue(name, params, defaults) {
    let v = params[name];
    return (v === undefined) ? defaults[name] : v;
}
