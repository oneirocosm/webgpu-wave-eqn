export class Energies {
    device: GPUDevice;
    inBuffer: GPUBuffer;
    outBuffer: GPUBuffer;
    outStageBuffer: GPUBuffer;
    clickBuffer: GPUBuffer;
    inClicks: GPUBuffer;
    canvasSize: [number, number];
    frameSize: number;
    oldCycle: ArrayBuffer;
    tempBuffer: GPUBuffer;
    emptyBuffer: GPUBuffer;

    constructor(device: GPUDevice, canvasSize: [number, number]) {
        this.device = device;
        this.canvasSize = canvasSize;
        this.frameSize = canvasSize[0] * canvasSize[1];
        const descriptor: GPUBufferDescriptor = {
            size: 3 * this.frameSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        };
        this.inBuffer = device.createBuffer(descriptor);

        // maybe a click buffer makes sense?  Much to think about.
        /*
        this.clickBuffer = device.createBuffer({
            size: this.numClicks * 2 * Uint32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        })*/
        const outDesc: GPUBufferDescriptor = {
            size: this.frameSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        };
        this.outBuffer = device.createBuffer(outDesc);

        this.outStageBuffer = device.createBuffer({
            size: this.frameSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });
        this.emptyBuffer = device.createBuffer({
            size: this.frameSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });
        this.tempBuffer = device.createBuffer({
            size: Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.oldCycle = new ArrayBuffer(this.frameSize);

        let unit = new Float32Array(1);
        unit.set([0.9], 0);
        this.device.queue.writeBuffer(this.tempBuffer, 0, unit);
    }

    updateClicks(readyForEntry: Array<[number, number]>) {
        let unit = new Float32Array(Float32Array.BYTES_PER_ELEMENT);
        unit.set([10.0], 0);
        readyForEntry.forEach((point) => {
            let index = point[1] * this.canvasSize[0] + point[0];
            console.log(`writing to index ${index} out of ${this.canvasSize}`);
            this.device.queue.writeBuffer(this.inBuffer, index * 4, unit);
        });
    }

    stageOutput(commandEncoder: GPUCommandEncoder) {
        commandEncoder.copyBufferToBuffer(
            this.inBuffer, this.frameSize * Float32Array.BYTES_PER_ELEMENT,
            this.outStageBuffer, 0,
            this.frameSize * Float32Array.BYTES_PER_ELEMENT,
        );
        commandEncoder.copyBufferToBuffer(
            this.outStageBuffer, 0,
            this.inBuffer, this.frameSize * Float32Array.BYTES_PER_ELEMENT * 2,
            this.frameSize * Float32Array.BYTES_PER_ELEMENT,
        );
        commandEncoder.copyBufferToBuffer(
            this.emptyBuffer, 0,
            this.inBuffer, 0,
            this.frameSize * Float32Array.BYTES_PER_ELEMENT,
        );
        commandEncoder.copyBufferToBuffer(
            this.outBuffer, 0,
            this.inBuffer, this.frameSize * Float32Array.BYTES_PER_ELEMENT,
            this.frameSize * Float32Array.BYTES_PER_ELEMENT,
        );
    }
}