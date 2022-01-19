let registry = [];
let cb;

export function subscribe(x) {
    cb = x;
}

export function register(x) {
    // React gotcha: registry.push(x) won't cause the components to re-render
    // b/c the array passed to setState is not changed
    registry = [...registry, x];
    cb && cb(registry);
}
