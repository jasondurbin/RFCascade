import {ColormapControl, hsv2rgb, rgb2hex, rgb2rgb} from "./cmap-util.js"
import {MeshColormaps} from "./cmap-mesh-colors.js"

const cms = [];
MeshColormaps.forEach((c) => {
	cms.push(c.name);
})
cms.push('rainbow');
cms.push('hsv');
MeshColormaps.forEach((c) => {
	if (c.reversable) cms.push(c.name + "_r");
})
cms.push('rainbow_r');
cms.push('hsv_r');

export class MeshColormapControl extends ColormapControl{
	static Colormaps = cms
	static find_colormap = find_mesh_colormap;
}
/**
 * Find and return colormap based on input `name`.
 *
 * @param {string} name
 * @param {Boolean} hex Should hex (#000000) be enforced instead of "rgb()"?
 *
 * @return {(v: Number) => String} Function to convert input value to color string.
 * */
export function find_mesh_colormap(name, hex){
	const rev = name.endsWith('_r');
	if (rev) name = name.substring(0, name.length - 2);
	if (name == 'rainbow') return _func_wrapper(_rainbow_cmap, rev, hex);
	if (name == 'hsv') return _func_wrapper((v) => {return hsv2rgb(v, 1, 1);}, rev);
	for (let i = 0; i < MeshColormaps.length; i++) if (MeshColormaps[i].name == name) return _array_wrapper(MeshColormaps[i].colors, rev, hex);
	throw Error(`Missing colormap: ${name}.`)
}

function _func_wrapper(func, reverse, hex){
	if (reverse === undefined) reverse = false;
	return (value) => {
		if (isNaN(value)) return `#000000`
		if (!isFinite(value)) return `#000000`
		let v = Math.max(0, Math.min(1, value));
		if (reverse) v = 1 - v;
		const [r, g, b] = func(v);
		if (hex) return rgb2hex(r, g, b);
		return rgb2rgb(r, g, b);
	}
}

function _array_wrapper(colors, reverse, hex){
	if (reverse === undefined) reverse = false;
	return (value) => {
		if (isNaN(value)) return `#000000`
		if (!isFinite(value)) return `#000000`
		let v = Math.max(0, Math.min(1, value));
		if (reverse) v = 1 - v;
		let i = v * (colors.length - 1);
		let i1 = Math.floor(i);
		let i2 = Math.min(i1 + 1, colors.length - 1);
		let f = i - i1;
		let c1 = colors[i1];
		let c2 = colors[i2];
		let scale = (o) => {return (c1[o] + f*(c2[o] - c1[o]));}
		if (hex) return rgb2hex(scale(0), scale(1), scale(2));
		return rgb2rgb(scale(0), scale(1), scale(2));
	}
}

function _rainbow_cmap(v){
	const r = Math.max(0, Math.min(1, 1.5 - 4 * Math.abs(v - 0.75)));
	const g = Math.max(0, Math.min(1, 1.5 - 4 * Math.abs(v - 0.5)));
	const b = Math.max(0, Math.min(1, 1.5 - 4 * Math.abs(v - 0.25)));
	return [r, g, b];
}
