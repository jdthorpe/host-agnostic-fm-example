export async function work() {
    const register = await import("host/Register");
    register.register("Hi from Module A");
}
