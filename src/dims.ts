export class Dims {
    buffer: GPUBuffer;
    bufferLayout: GPUVertexBufferLayout;

    constructor(device: GPUDevice, canvasSize: [number, number]) {
        const vertices: Float32Array = new Float32Array(canvasSize);
        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        };
        this.buffer = device.createBuffer(descriptor);
        new Float32Array(this.buffer.getMappedRange()).set(vertices)
        this.buffer.unmap();

        this.bufferLayout = {
            arrayStride: vertices.byteLength,
            attributes: [
                {
                    shaderLocation: 0,
                    format: "float32x2",
                    offset: 0,
                },
            ]
        }
    }
}