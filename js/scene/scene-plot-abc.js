import {SceneObjectABC} from "./scene-abc.js"
/** @import { ColormapControl } from "../cmap/cmap-util.js" */
/** @import { SceneParent } from "./scene-abc.js" */

export class ScenePlotABC extends SceneObjectABC{
	/**
	* Create a new plot on a canvas.
	*
	* @param {SceneParent} parent
	* @param {HTMLCanvasElement} canvas
	* @param {ColormapControl} cmap
	* */
	constructor(parent, canvas, cmap){
		super(parent.prepend, []);
		parent.add_child(this);
		this.parent = parent;
		this.canvas = canvas;
		this.cmap = cmap;
		this.ycontrols = null;
		this.xcontrols = null;
		this.redrawWaiting = true;
	}
	delete(){
		this.canvas.remove();
		if (this.ycontrols !== null) for (const v of Object.values(this.ycontrols)) v.remove();
		if (this.xcontrols !== null) for (const v of Object.values(this.xcontrols)) v.remove()
		const cm = this.cmap;
		super.delete();
		this.redrawWaiting = false;
		cm.delete();
	}
	_config_ax(min, max, steps, cons){
		if (cons === null) return [min, max, steps];
		const ovsc = cons['auto_scale'].checked;
		const ovst = cons['auto_steps'].checked;

		const pmin = cons['min'].value;
		const pmax = cons['max'].value;
		const psteps = cons['steps'].value;

		if (pmin == '' || ovsc) cons['min'].value = min;
		if (pmax == '' || ovsc) cons['max'].value = max;
		if (psteps == '' || ovst) cons['steps'].value = steps;
		cons['min'].disabled = ovsc;
		cons['max'].disabled = ovsc;
		cons['steps'].disabled = ovst;
		return [
			Number(cons['min'].value),
			Number(cons['max'].value),
			Math.max(2, Number(cons['steps'].value)),
		]
	}
	config_auto_y(min, max, steps){
		return this._config_ax(min, max, steps, this.ycontrols);
	}
	config_auto_x(min, max, steps){
		return this._config_ax(min, max, steps, this.xcontrols);
	}
	axis_controls(axis){
		if (axis == 'x') return this.xcontrols
		if (axis == 'y') return this.ycontrols;
		else throw Error(`Unknown axis '${axis}'.`);
	}
	save_axis_config(axis){
		const cons = this.axis_controls(axis);
		if (cons === null) return null;
		return [
			Boolean(cons['auto_scale'].checked) ? 1 : 0,
			Number(cons['min'].value),
			Number(cons['max'].value),
			Number(cons['steps'].value),
			Boolean(cons['auto_steps'].checked) ? 1 : 0,
		]
	}
	load_axis_config(axis, config){
		const cons = this.axis_controls(axis);
		cons['auto_scale'].checked = Boolean(config[0]);
		cons['min'].value = config[1];
		cons['max'].value = config[2];
		cons['steps'].value = config[3];
		cons['auto_steps'].value = Boolean(config[5]);
	}
	install_axis_controls(axis, controls){
		if (axis == 'x') this.xcontrols = controls;
		else if (axis == 'y') this.ycontrols = controls;
		else throw Error(`Unknown axis '${axis}'.`);

		this.add_event_types(axis + "-axis-controls-change", "axis-controls-change");
		['min', 'max', 'auto_scale', 'steps', 'auto_steps'].forEach((k) => {
			this.register_dom_event(controls[k], 'change', () => {
				this.redrawWaiting = true;
				this.trigger_event(axis + "-axis-controls-change");
				this.trigger_event("axis-controls-change");
			})
		})
		controls['steps'].setAttribute('min', 2);
		controls['steps'].setAttribute('max', 101);
	}
	install_scale_control(key){
		const ele = this.find_element(key);
		const _val = () => {
			const v = -Math.max(5, Math.abs(ele.value));
			ele.value = Math.abs(v);
			return v;
		}
		ele.addEventListener('change', () => {
			this.y_min = _val();
			this.trigger_event('data-min-changed', this.y_min);
		})
		this.y_min = _val();
	}
	/**
	* Return the selected colormap.
	*
	* @returns {String}
	* */
	selected_cmap(){ return this.cmap.selector.value; }
	create_hover_items(){
		const canvas = this.canvas;
		const p = canvas.parentElement.parentElement;
		const h = p.querySelector(".canvas-header");
		const ele = document.createElement("div");
		ele.classList = "canvas-hover-div";
		ele.innerHTML = "&nbsp;";
		canvas.hover_container = ele;
		h.appendChild(ele);

		canvas.addEventListener('mouseleave', () => {
			if (this.queue !== undefined && this.queue.running) return;
			canvas.hover_container.innerHTML = "&nbsp";
		});
	}
	create_progress_bar(){
		const canvas = this.canvas;
		const p = canvas.parentElement.parentElement;
		const h = p.querySelector(".canvas-header");
		const ele = document.createElement("progress");
		ele.value = 100;
		ele.max = 100;
		h.appendChild(ele);
	}
	create_queue(){
		const canvas = this.canvas;
		const p = canvas.parentElement.parentElement;
		const h = p.querySelector(".canvas-header");
		super.create_queue(h.querySelector("progress"), h.querySelector(".canvas-hover-div"));
	}
}
