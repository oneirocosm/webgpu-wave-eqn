export class QuadMesh {
    buffer: GPUBuffer;
    bufferLayout: GPUVertexBufferLayout;

    constructor(device: GPUDevice) {
        const vertices: Float32Array = new Float32Array(
            [
                -1.0, -1.0, 0.0, 1.0,
                1.0, -1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 0.0,

                -1.0, -1.0, 0.0, 1.0,
                1.0, 1.0, 1.0, 0.0,
                -1.0, 1.0, 0.0, 0.0,
            ]
        );
        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        };
        this.buffer = device.createBuffer(descriptor);
        new Float32Array(this.buffer.getMappedRange()).set(vertices);
        this.buffer.unmap();

        this.bufferLayout = {
            arrayStride: 16,
            attributes: [
                {
                    shaderLocation: 0,
                    format: "float32x2",
                    offset: 0,
                },
                {
                    shaderLocation: 1,
                    format: "float32x2",
                    offset: 8,
                },
            ]
        }
    }
}