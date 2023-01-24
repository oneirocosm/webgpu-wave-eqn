import shader from "./shaders/shaders.wgsl";
import { Material } from "./material";
import { QuadMesh } from "./quad-mesh";

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
    materialGroupLayout: GPUBindGroupLayout;

    //assets
    backgroundMaterial: Material;
    backgroundMesh: QuadMesh;
    energyBuffer: GPUBuffer;
    dimBuffer: GPUBuffer;

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
            entries: [
                /*
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "storage",
                        hasDynamicOffset: false,
                    },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform",
                        hasDynamicOffset: false,
                    },
                },
                */
            ]
        });

        this.materialGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {},
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {},
                },
            ]
        });
    }

    async createAssets() {
        this.backgroundMesh = new QuadMesh(this.device);

        this.backgroundMaterial = new Material();
        await this.backgroundMaterial.initialize(this.device, "dist/img/blank-square.jpg", this.materialGroupLayout);
    }

    async makePipeline() {
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.materialGroupLayout],
        });

        this.pipeline = this.device.createRenderPipeline({
            vertex: {
                module: this.device.createShaderModule({
                    code: shader,
                }),
                entryPoint: "vs_main",
                buffers: [this.backgroundMesh.bufferLayout],
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
            entries: [
                /*
                {
                    binding: 0,
                    resource: {
                        buffer: this.coordBuffer,
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.coordBuffer,
                    }
                },
                */
            ],
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
        renderpass.setVertexBuffer(0, this.backgroundMesh.buffer);
        renderpass.setBindGroup(0, this.backgroundMaterial.bindGroup);
        renderpass.draw(6);
        renderpass.end();

        this.device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(this.render);
    }
}