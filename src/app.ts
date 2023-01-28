import { Renderer } from "./renderer";
import { ClickQueue } from "./click-queue";

export class App {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    clickQueue: ClickQueue;

    keyLabel: HTMLElement;
    mouseXLabel: HTMLElement;
    mouseYLabel: HTMLElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.clickQueue = new ClickQueue();
        canvas.addEventListener('click', (event) => getClick(canvas, this.clickQueue, event));

        /*
        this.canvas.onclick = () => {
            this.canvas.requestPointerLock();
        }
        */
    }

    async initialize() {
        await this.renderer.Initialize();
    }

    run = () => {
        let running: boolean = true;

        this.renderer.render(this.clickQueue);

        if (running) {
            requestAnimationFrame(this.run);
        }
    }
}

function getClick(canvas: HTMLCanvasElement, clickQueue: ClickQueue, event: MouseEvent) {
    const boundBox = canvas.getBoundingClientRect();
    const x = event.clientX - boundBox.left;
    const y = event.clientY - boundBox.top;
    clickQueue.clicks.push([x, y]);
    console.log(`click at ${[x, y]}`);
}