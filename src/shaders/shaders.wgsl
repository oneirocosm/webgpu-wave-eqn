struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}


//@group(0) @binding(0) var<storage, read_write> energies: array<mat2x2<f32>>;
//@group(0) @binding(1) var<uniform> dim: vec2<f32>;

@group(0) @binding(0) var wall_texture: texture_2d<f32>;
@group(0) @binding(1) var wall_sampler: sampler;

@vertex
fn vs_main(
    @location(0) position: vec2<f32>,
    @location(1) uv: vec2<f32>) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4<f32>(position, 0.0, 1.0);
    output.uv = uv;
    return output;
}

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    var out_color: vec4<f32>;
    let wall_val = textureSample(wall_texture, wall_sampler, uv);

    if (is_wall(wall_val)) {
        out_color = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    } else {
        out_color = vec4<f32>(uv, 0.0, 1.0);
    }
    return out_color;
}

fn is_wall(rgb_color: vec4<f32>) -> bool {
    let weights = vec4<f32>(0.299, 0.587, 0.114, 0.0);
    let shade_val: f32 = dot(rgb_color, weights);
    let cutoff_val: f32 = 0.5;
    return shade_val < cutoff_val;
}

fn rgb2bw(rgb_color: vec4<f32>) -> vec4<f32>{
    let weights = vec4<f32>(0.299, 0.587, 0.114, 0.0);
    let shade_val: f32 = dot(rgb_color, weights);
    let cutoff_val: f32 = 0.5;
    var bw_val: f32;
    if (shade_val >= cutoff_val) {
        bw_val = 255.0;
    } else {
        bw_val = 0.0;
    }
    return vec4<f32>(bw_val, bw_val, bw_val, rgb_color[3]);
}

fn rgb2gray(rgb_color: vec4<f32>) -> vec4<f32> {
    let weights = vec4<f32>(0.299, 0.587, 0.114, 0.0);
    let shade_val: f32 = dot(rgb_color, weights);
    return vec4<f32>(shade_val, shade_val, shade_val, rgb_color[3]);
}