struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}


@group(0) @binding(0) var wall_texture: texture_2d<f32>;
@group(0) @binding(1) var wall_sampler: sampler;

@group(1) @binding(0) var<storage, read> energies: array<f32>;
@group(1) @binding(1) var<storage, read_write> outputs: array<f32>;
@group(1) @binding(2) var<uniform> temp: f32;


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
    var out_color: vec4<f32>;
    let wall_val = textureSample(wall_texture, wall_sampler, uv);
    let arr_ptr = &energies;
    let chunk_size: u32 = arrayLength(arr_ptr) / u32(3);

    var new_energy: f32;
    if (is_wall(wall_val)) {
        new_energy = 0.0;
        out_color = vec4<f32>(1.0, 1.0, 1.0, 1.0);
    } else {
        
        let energy_here = get_energy(pos.xy, 1, 0, 0);
        let energy_left = get_energy(pos.xy, 1, -1, 0);
        let energy_right = get_energy(pos.xy, 1, 1, 0);
        let energy_top = get_energy(pos.xy, 1, 0, -1);
        let energy_bottom = get_energy(pos.xy, 1, 0, 1);
        let energy_old = get_energy(pos.xy, 2, 0, 0);
        new_energy = (-4.0 * energy_here + energy_left + energy_right + energy_top + energy_bottom) * 0.7 * 0.7
         + 2.0 * energy_here - energy_old;
        
        let energy_click = get_energy(pos.xy, 0, 0, 0);
        //let tpos = vec2<i32>(pos.xy);
        //let id = u32(tpos.y * 800 + tpos.x);
        //let energy_click = energies[id];
        new_energy += energy_click;
        //if (energy_click > 0.0) {
        //    new_energy += energy_click;
        //}
        //new_energy = 0.0;
        let color_scaling = new_energy/2.0 + 0.5;
        out_color = vec4<f32>(color_scaling, 0.0, color_scaling, 1.0);

        //out_color = vec4<f32>(1.0, 0.0 , 1.0, new_energy) * energy_click;
    }
    //out_color += vec4<f32>(1.0, 0.0, 1.0, 1.0) * click_mask;
    //out_color += vec4<f32>(temp, temp, temp, 0.0);

    let id = u32(pos.y) * 800u + u32(pos.x);
    //let temp_energy = energies[id];
    outputs[id] = new_energy;
    //let energy_click = get_energy(pos.xy, 0, 0, 0);
    //out_color += vec4<f32>(1.0, 0.0 , 1.0, 1.0) * temp_energy;
    return out_color;
}

fn is_wall(rgb_color: vec4<f32>) -> bool {
    let weights = vec4<f32>(0.299, 0.587, 0.114, 0.0);
    let shade_val: f32 = dot(rgb_color, weights);
    let cutoff_val: f32 = 0.5;
    return shade_val < cutoff_val || rgb_color.a <= 0.01;
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