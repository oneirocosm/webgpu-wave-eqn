
import { Renderer } from "./renderer";

main();

async function main() {
    const canvas = <HTMLCanvasElement> document.getElementById("gfx-main");
    const renderer = new Renderer(canvas);
    await renderer.Initialize();
    renderer.render();
}