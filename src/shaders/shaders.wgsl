struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@group(0) @binding(0) var wall_texture: texture_2d<f32>;
@group(0) @binding(1) var wall_sampler: sampler;

@group(1) @binding(0) var<storage, read> inputs: array<f32>;
@group(1) @binding(1) var<storage, read_write> energies: array<f32>;
@group(1) @binding(2) var<uniform> buffer_start: i32;

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
    let new_energy = get_new_energy(pos.xy, wall_mask);

    write_new_energy(new_energy, pos.xy, 0);
    //write_new_energy(0.0, pos.xy, -2);

    let out_color = energy2color(new_energy) * wall_mask;
    let temp = energies[0];
    let temp2 = energies[800*800];
    let temp3 = energies[2*800*800];
    //let out_color = vec4<f32>(temp, temp2, temp3, 1.0);
    return out_color;
    //return wave_color(pos.xy) * wall_mask;
}

fn energy2color(energy: f32) -> vec4<f32> {
    let color_scaling = energy/2.0 + 0.5;
    return vec4<f32>(color_scaling, 0.0, color_scaling, 1.0);
}

fn write_new_energy(energy: f32, pos: vec2<f32>, time_offset: i32) {
    let id = get_id(pos, time_offset);
    energies[id] = energy;
}

fn get_new_energy(pos: vec2<f32>, wall_mask: f32) -> f32 {
    let energy_here = get_energy(pos.xy, -1, 0, 0);
    let energy_left = get_energy(pos.xy, -1, -1, 0);
    let energy_right = get_energy(pos.xy, -1, 1, 0);
    let energy_top = get_energy(pos.xy, -1, 0, -1);
    let energy_bottom = get_energy(pos.xy, -1, 0, 1);
    let energy_old = get_energy(pos.xy, -2, 0, 0);
    var fdbk_energy = (-4.0 * energy_here + energy_left + energy_right + energy_top + energy_bottom) * 0.7 * 0.7
     + 2.0 * energy_here - energy_old;
    //fdbk_energy = 0.0;

    let id = u32(pos.y) * 800u + u32(pos.x);
    let input_energy = inputs[id];
    return (fdbk_energy + input_energy) * wall_mask * 0.9999;
}

fn wave_color(pos: vec2<f32>) -> vec4<f32> {
    let cur_id = get_id(pos, 0);
    let id_one_past = get_id(pos, -1);
    let id_two_past = get_id(pos, -2);

    let red = energies[cur_id]/2.0 + 0.5;
    let green = energies[id_one_past]/2.0 + 0.5;
    let blue = energies[id_two_past]/2.0 + 0.5;
    return vec4<f32>(red, green, blue, 1.0);
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
    let search_time = (buffer_start + 3 + time_offset) % 3;
    let search_pos = vec2<i32>(position) + vec2<i32>(x_offset, y_offset);
    if (0 > search_pos.x || search_pos.x >= 800 || 0 > search_pos.y || search_pos.y >= 800) {
        return 0.0;
    }

    let index = time_width * search_time + width * search_pos.y + search_pos.x;
    return energies[index];
}

fn get_id(pos: vec2<f32>, time_offset: i32) -> i32 {
    let search_pos = vec2<i32>(pos);
    let search_time = (buffer_start + 3 + time_offset) % 3;
    return search_time * 800 * 800 + 800 * search_pos.y + search_pos.x;
}