import React, { useState, useEffect, useCallback } from "react";
// NO!! import { subscribe } from "./Register";

function App() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        (async () => {
            // Federated Module Gotcha: using `import("./Register")` here will
            // load a diffferent instance of the Register module from the one
            // imported in the remote via `import("host/Register")`, and the
            // hence host an dremote module won't actually be sharing data by
            // way of the "Register" module

            const { subscribe } = await import("host/Register");
            subscribe(setItems);
        })();
    }, [setItems]);

    const do_work = useCallback(async () => {
        // Federated Module Gotcha: Dynamic imports are not really dynamic (for
        // now, anyway). Specificaly, something like this doesn't work:
        //
        //    let name = "module_a"
        //    const WorkModule = await import(`module_a/Work`)
        //
        // related issue:
        // https://github.com/module-federation/module-federation-examples/issues/1323

        const { work } = await import(`module_a/Work`);
        work();
    }, []);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxWidth: 300,
            }}
        >
            <button onClick={() => do_work()}>Do work in Module A</button>
            {items.length === 0 ? (
                "Nothing to show yet"
            ) : (
                <ul>
                    {items.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;
