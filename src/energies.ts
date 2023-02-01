export class Energies {
    device: GPUDevice;
    inputBuffer: GPUBuffer;
    energyBuffer: GPUBuffer;
    uniformBuffer: GPUBuffer;

    cycleCount: number;
    canvasSize: [number, number];
    frameSize: number;

    /*
    outBuffer: GPUBuffer;
    outStageBuffer: GPUBuffer;
    inClicks: GPUBuffer;
    oldCycle: ArrayBuffer;
    countBuffer: GPUBuffer;
    emptyBuffer: GPUBuffer;
    */

    constructor(device: GPUDevice, canvasSize: [number, number]) {
        this.device = device;
        this.canvasSize = canvasSize;
        this.frameSize = canvasSize[0] * canvasSize[1];
        this.cycleCount = 0;

        this.inputBuffer = device.createBuffer({
            size: this.frameSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.energyBuffer = device.createBuffer({
            size: 3 * this.frameSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.STORAGE,
        });

        this.uniformBuffer = device.createBuffer({
            size: Int32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
    }

    updateClicks(readyForEntry: Array<[number, number]>) {
        this.cycleCount = (this.cycleCount + 1) % 3;
        let unit = new Float32Array(Float32Array.BYTES_PER_ELEMENT);
        unit.set([10.0], 0);
        readyForEntry.forEach((point) => {
            let index = point[1] * this.canvasSize[0] + point[0];
            console.log(`writing to index ${index} out of ${this.frameSize}. canvas size is ${this.canvasSize}`);
            this.device.queue.writeBuffer(this.inputBuffer, index * 4, unit);
        });

        let countBuffer = new Int32Array(1);
        countBuffer.set([this.cycleCount], 0);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, countBuffer);
    }

    clearClicks(readyForEntry: Array<[number, number]>) {
        let unit = new Float32Array(Float32Array.BYTES_PER_ELEMENT);
        unit.set([0.0], 0);
        readyForEntry.forEach((point) => {
            let index = point[1] * this.canvasSize[0] + point[0];
            this.device.queue.writeBuffer(this.inputBuffer, index * 4, unit);
        });

    }
}