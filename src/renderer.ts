import shader from "./shaders/shaders.wgsl";

export class Renderer {
    canvas: HTMLCanvasElement;

    // device/context objects
    adapter: GPUAdapter;
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;

    // pipeline objects
    pipeline: GPURenderPipeline;
    bindGroupLayout: GPUBindGroupLayout;
    bindGroup: GPUBindGroup;

    //assets
    frameBuffer: GPUBuffer;
    bufferLayout: GPUVertexBufferLayout;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    async Initialize() {
        await this.setupDevice();
        await this.makeBindGroupLayouts();
        await this.createAssets();
        await this.makePipeline();
        await this.makeBindGroup();
    }

    async setupDevice() {
        this.adapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
        this.device = <GPUDevice> await this.adapter?.requestDevice();
        this.context = <GPUCanvasContext> this.canvas.getContext("webgpu");
        this.format = "bgra8unorm";
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "opaque",
        });
    }

    async makeBindGroupLayouts() {
        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: [],
                /*
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {},
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {},
                },
            ]*/
        });
    }

    async createAssets() {
        const frameData = new Float32Array([
            -1.0, -1.0, 0.0, 0.0,
            1.0, -1.0, 1.0, 0.0,
            1.0, 1.0, 1.0, 1.0,

            -1.0, -1.0, 0.0, 0.0,
            1.0, 1.0, 1.0, 1.0,
            -1.0, 1.0, 0.0, 1.0,
        ]);

        const descriptor: GPUBufferDescriptor = {
            size: frameData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        };

        this.frameBuffer = this.device.createBuffer(descriptor);
        new Float32Array(this.frameBuffer.getMappedRange()).set(frameData);
        this.frameBuffer.unmap();

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
            ],
        };
    }

    async makePipeline() {
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [],
        });

        this.pipeline = this.device.createRenderPipeline({
            vertex: {
                module: this.device.createShaderModule({
                    code: shader,
                }),
                entryPoint: "vs_main",
                buffers: [this.bufferLayout],
            },
            fragment: {
                module: this.device.createShaderModule({
                    code: shader,
                }),
                entryPoint: "fs_main",
                targets: [{
                    format: this.format,
                }],
            },
            primitive: {
                topology: "triangle-list"
            },
            layout: pipelineLayout,
        });
    }

    async makeBindGroup() {
        this.bindGroup = this.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [],
                /*
                {
                    binding: 0,
                    resource: {
                        buffer: this.frameBuffer,
                    }
                },
                {
                    binding: 0,
                    resource: {
                        buffer: this.frameBuffer,
                    }
                },
            ],*/
        })

    }

    render = () => {
        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();
        const textureView: GPUTextureView = this.context.getCurrentTexture().createView();
        const renderpass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {r: 0.5, g: 0.0, b: 0.25, a: 1.0},
                loadOp: "clear",
                storeOp: "store",
            }]
        });
        renderpass.setPipeline(this.pipeline);
        renderpass.setVertexBuffer(0, this.frameBuffer);
        renderpass.draw(6);
        renderpass.end();

        this.device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(this.render);
    }
}