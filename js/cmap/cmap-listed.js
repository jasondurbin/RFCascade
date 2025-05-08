import {ColormapControl, rgb2hex, rgb2rgb} from "./cmap-util.js"
import {ListedColormaps} from "./cmap-listed-colors.js"


const cms = [];
ListedColormaps.forEach((c) => {
	cms.push(c.name);
})
ListedColormaps.forEach((c) => {
	if (c.reversable) cms.push(c.name + "_r");
})

export class ListedColormapControl extends ColormapControl{
	static Colormaps = cms
	static find_colormap = find_listed_colormap;
}

/**
 * Find and return colormap based on input `name`.
 *
 * @param {String} name
 * @param {Boolean} hex Should hex (#000000) be enforced instead of "rgb()"?
 *
 * @return {(v: Number) => String} Function to convert input value to color string.
 * */
export function find_listed_colormap(name, hex){
	const rev = name.endsWith('_r');
	if (rev) name = name.substring(0, name.length - 2);
	for (let i = 0; i < ListedColormaps.length; i++) if (ListedColormaps[i].name == name) return _array_wrapper(ListedColormaps[i].colors, rev, hex);
	throw Error(`Missing colormap: ${name}.`)
}

function _array_wrapper(colors, reverse, hex){
	if (reverse === undefined) reverse = false;
	if (hex === undefined) hex = false;

	return (value) => {
		if (isNaN(value)) return '#000'
		if (!isFinite(value)) return '#000'
		if (reverse) value = colors.length - value - 1;
		const [r, g, b] = colors[value % colors.length]
		if (!hex) return rgb2rgb(r, g, b);
		return rgb2hex(r, g, b);
	}
}
