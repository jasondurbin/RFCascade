import {SceneObjectEvent} from "../scene/scene-event-obj.js"
/**
 * @import {ListedColormapControl} from "./cmap-listed.js"
 * @import {MeshColormapControl} from "./cmap-mesh.js"
 * @typedef {ListedColormapControl | MeshColormapControl} ColormapControlAny
 * */

export class ColormapControl extends SceneObjectEvent{
	/**
	 * Create a generic ColormapControl
	 *
	 * @param {HTMLSelectElement} selector
	 * @param {String} [defaultSelection]
	 * */
	constructor(selector, defaultSelection){
		super();
		this.add_event_types('change');
		this.changed = true;
		this.selector = selector;
		if (defaultSelection === undefined) defaultSelection = 'viridis';
		this.defaultSelection = defaultSelection;
		this.constructor.Colormaps.forEach((cm) => {
			const ele = document.createElement('option');
			ele.value = cm;
			ele.innerHTML = cm;
			selector.appendChild(ele);
			if (defaultSelection == cm) ele.selected = true;
		});
		this.register_dom_event(selector, 'change', () => {
			this.changed = true;
			this.trigger_event('change');
		})
		this.register_dom_event(window.theme, 'theme-change', () => {this.changed = true;})
	}
	delete(){
		this.selector.remove();
		super.delete();
	}
	/**
	 * Create and return cmap finder.
	 *
	 * @param {Boolean} [hex] Should HEX (#000) be enforced instead of rgb()?
	 *
	 * @returns {(v: Number) => String} Function to convert value to color
	 */
	cmap(hex){
		const cms = this.constructor.Colormaps;
		const find_colormap = this.constructor.find_colormap;
		for (let i = 0; i < cms.length; i++)
			if (this.selector[i].selected)
				return find_colormap(cms[i], hex);
		return find_colormap(this.defaultSelection, hex);
	}
}

/**
 * Convert HSV to RGB.
 *
 * @param {Number} h Hue (0-1).
 * @param {Number} s Saturation (0-1).
 * @param {Number} v Value (0-1).
 *
 * @returns {[Number, Number, Number]} rbg color (0-1).
 */
export function hsv2rgb(h, s, v){
	let r, g, b;

	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);

	switch (i % 6){
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		case 5:
			r = v;
			g = p;
			b = q;
			break;
	}
	return [r, g, b];
}

const _hex = (c) => {
	const v = Math.min(255, Math.max(0, Math.round(c*255))).toString(16);
	return v.length == 1 ? "0" + v : v
}

/**
 * Convert RGB to Hex.
 *
 * @param {Number} r Red (0-1).
 * @param {Number} g Green (0-1).
 * @param {Number} b Blue (0-1).
 *
 * @returns {String} hex color.
 */
export function rgb2hex(r, g, b){return `#${_hex(r)}${_hex(g)}${_hex(b)}`;}

const _c = (v) => {
	return Math.min(255, Math.max(0, v*255));
}
/**
 * Convert RGB to RGB string.
 *
 * @param {Number} r Red (0-1).
 * @param {Number} g Green (0-1).
 * @param {Number} b Blue (0-1).
 *
 * @returns {String} rgb() string.
 */
export function rgb2rgb(r, g, b){return `rgb(${_c(r)},${_c(g)},${_c(b)})`;}
