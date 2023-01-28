import { App } from "./app";

main();

async function main() {
    const canvas = <HTMLCanvasElement> document.getElementById("gfx-main");
    const app = new App(canvas);
    await app.initialize();
    app.run();
}
