struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}


@group(0) @binding(0) var wall_texture: texture_2d<f32>;
@group(0) @binding(1) var wall_sampler: sampler;

@group(1) @binding(0) var<storage, read> energies: array<f32>;
@group(1) @binding(1) var<storage, read_write> outputs: array<f32>;
@group(1) @binding(2) var<uniform> count: u32;


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
fn fs_main(@location(0) uv: vec2<f32>,
           @builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let wall_val = textureSample(wall_texture, wall_sampler, uv);

    let wall_mask = create_wall_mask(wall_val);

    let energy_here = get_energy(pos.xy, 1, 0, 0);
    let energy_left = get_energy(pos.xy, 1, -1, 0);
    let energy_right = get_energy(pos.xy, 1, 1, 0);
    let energy_top = get_energy(pos.xy, 1, 0, -1);
    let energy_bottom = get_energy(pos.xy, 1, 0, 1);
    let energy_old = get_energy(pos.xy, 2, 0, 0);
    let fdbk_energy = (-4.0 * energy_here + energy_left + energy_right + energy_top + energy_bottom) * 0.7 * 0.7
     + 2.0 * energy_here - energy_old;

    let input_energy = get_energy(pos.xy, 0, 0, 0);
    let new_energy = (fdbk_energy + input_energy) * wall_mask * 0.9999;

    //let id = u32(pos.y) * 800u + u32(pos.x);
    let id = get_id(pos.xy, 0u);
    outputs[id] = new_energy;

    let color_scaling = new_energy/2.0 + 0.5;
    let out_color = vec4<f32>(color_scaling, 0.0, color_scaling, 1.0) * wall_mask;

    return out_color;
    //return wave_color(pos.xy) * wall_mask;
}

fn wave_color(pos: vec2<f32>) -> vec4<f32> {
    let cur_id = get_id(pos, 0u);
    let id_one_past = get_id(pos, 1u);
    let id_two_past = get_id(pos, 2u);

    let red = energies[cur_id]/2.0 + 0.5;
    let green = energies[id_one_past]/2.0 + 0.5;
    let blue = energies[id_two_past]/2.0 + 0.5;
    return vec4<f32>(red, green, blue, 1.0);
}

fn get_id(pos: vec2<f32>, time_offset: u32) -> u32 {
    let search_pos = vec2<u32>(pos);
    return time_offset * 800u * 800u + 800u * search_pos.y + search_pos.x;
}

fn create_wall_mask(rgb_color: vec4<f32>) -> f32 {
    let weights = vec4<f32>(0.299, 0.587, 0.114, 0.0);
    let shade_val: f32 = dot(rgb_color, weights);
    let cutoff_val: f32 = 0.5;
    return step(cutoff_val, shade_val);
}

fn rgb2bw(rgb_color: vec4<f32>) -> vec4<f32>{
    let weights = vec4<f32>(0.299, 0.587, 0.114, 0.0);
    let shade_val: f32 = dot(rgb_color, weights);
    let cutoff_val: f32 = 0.2;
    let bw_val = step(cutoff_val, shade_val);
    return vec4<f32>(bw_val, bw_val, bw_val, rgb_color[3]);
}

fn rgb2gray(rgb_color: vec4<f32>) -> vec4<f32> {
    let weights = vec4<f32>(0.299, 0.587, 0.114, 0.0);
    let shade_val: f32 = dot(rgb_color, weights);
    return vec4<f32>(shade_val, shade_val, shade_val, rgb_color[3]);
}

fn get_energy(position: vec2<f32>, time_offset: i32, x_offset: i32, y_offset: i32) -> f32 {
    let time_width = 800 * 800;
    let width = 800;
    let searchPos = vec2<i32>(position) + vec2<i32>(x_offset, y_offset);
    if (0 > searchPos.x || searchPos.x >= 800 || 0 > searchPos.y || searchPos.y >= 800 || time_offset > 2 || time_offset < 0) {
        return 0.0;
    }

    let index = time_width * time_offset + width * searchPos.y + searchPos.x;
    return energies[u32(index)];
}