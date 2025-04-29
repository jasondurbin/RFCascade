/**
 * @typedef {SysBlockAmplifier | SysBlockPassive | SysBlockNode} BlockHint
 * @import {SceneControlSystemCalc} from "../index.js"
 * @import {KeyHintAny} from "./columns.js"
 */

export const c_T0 = 290;


export class SysCalculationNode{
	/**
	 * Create a new system starting node.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * */
	constructor(parent){
		this.parent = parent;
		this.signal_power = 10**((-10 - 30)/10);
		this.signal_power_ideal = this.signal_power;
		this.power_gain = 1.0;
		this.noise_power = parent.globals.noise_power;

		this.snr_start = this.snr_ideal;
	}
	get snr_ideal(){return this.signal_power_ideal/this.noise_power;}
	get kb(){ return this.parent.globals.kb; }
}

export class SysBlockABC{
	static is_node = false;
	static default_pars = {
		'color': "#000",
	};
	/**
	 * Create a new system block.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * @param {Object} pars
	 * */
	constructor(parent, pars){
		if (pars === undefined) pars = {};

		for(const [k, v] of Object.entries(this.constructor.default_pars)){
			if (pars.hasOwnProperty(k)) this[k] = pars[k];
			else this[k] = v;
		}
		this.index = 0;
		this.parent = parent;
		this.cells = {};
		this.calcpars = {};
		this.cascpars = {};
		this.inputs = {};
		this.enabled = true;
		this.icon_canvas = null;
		this.listeners = {};
	}
	get is_node(){ return this.constructor.is_node; }
	/**
	 * Retrieve a parameter from a block.
	 *
	 * @param {KeyHintAny} key
	 * @param {HTMLInputElement} input
	 * */
	map_input(key, input){
		this.inputs[key] = input;
	}
	process_inputs(){
		for (const [key, input] of Object.entries(this.inputs)){
			let v = input.value;
			if (input.getAttribute('type') == 'number') v = Number(v)
			this[key] = v;
		}
		let lshow = this.linearity == 'Ignore' ? 'none': 'inline';
		this.inputs['p1db'].style.display = lshow;

		if (this.icon_canvas !== null) this.draw_element_icon(this.icon_canvas);
	}
	map_cell(key, td){ this.cells[key] = td; }
	cell(key){ return this.cells[key]; }
	get title(){ return this.constructor.title; }
	/**
	 * Retrieve a parameter from a block.
	 *
	 * @param {KeyHintAny} key
	 * @returns {Number}
	 * */
	get_parameter(key){
		let val = this[key];
		if (val !== undefined && val !== null) return val;
		val = this.backup_parameter(key);
		if (val !== undefined && val !== null) return val;
		return this.calculate_parameter(key);
	}
	backup_parameter(key){ return null; }
	calculate_parameter(key){
		let val = this.calcpars[key];
		if (val !== undefined) return val;
		val = this.cascpars[key];
		if (val !== undefined) return val;

		const _gain_log = () => {
			return 10*Math.log10(this.get_parameter('power_gain'))
		}

		if (key == 'power_gain') val = 10**(Number(this.get_parameter('gain'))/10);
		else if (key == 'noise_factor') val = this.get_parameter('noise_figure_physical');
		else if (key == 'noise_temperature'){
			val = (10**(this.get_parameter('noise_figure')/10) - 1)*this.get_parameter('physical_temperature');
		}
		else if (key == 'noise_figure_physical') val = 1.0 + this.get_parameter('noise_temperature')/c_T0;
		else if (key == 'physical_temperature_offset') val = 0.0;
		else if (key == 'physical_temperature') val = this.get_parameter('physical_temperature_offset') + this.parent.globals.system_temperature;
		else if (key == 'op1db'){
			const d = this.get_parameter('linearity');

			if (d == 'Ignore') val = Infinity;
			else{
				val = Number(this.get_parameter('p1db'));
				if (d == 'Input Referred') val += _gain_log() - 1;
				val = 10**((val - 30)/10);
			}
		}
		else if (key == 'ip1db'){
			const o = this.get_parameter('op1db');
			if (o == Infinity) val = Infinity;
			else val = 10**((10*Math.log10(o) - _gain_log() + 1)/10);

		}
		else throw Error(`Unknown parameter ${key}.`)
		this.calcpars[key] = val;
		return val;
	}
	reset_parameters(){
		this.calcpars = {};
		this.cascpars = {};
	}
	add_cascade_parameter(key, value){ this.cascpars[key] = value; }
	/**
	 * Draw element's icon.
	 *
	 * @param {HTMLCanvasElement} canvas
	 * */
	draw_element_icon(canvas){
		const w = 50;
		const ctx = canvas.getContext('2d');
		canvas.width = w;
		canvas.height = w;
		ctx.lineWidth = 1/25;
		ctx.scale(w, w);
		this.draw_icon(ctx);
	}
}
export class SysBlockNode extends SysBlockABC{
	static title = 'Node';
	static is_node = true;
	static default_pars = {
		...SysBlockABC.default_pars,
		'gain': 0.0,
		'noise_figure': 0.0,
		'part_number': "[]",
		'p1db': Infinity,
		'linearity': "Ignore",
	}
	process_inputs(){}
}

export class SysBlockAmplifier extends SysBlockABC{
	static title = 'Amplifier';
	static default_pars = {
		...SysBlockABC.default_pars,
		'gain': 13,
		'noise_figure': 5,
		'part_number': "Amp",
		'p1db': 10,
		'linearity': "Output Referred",
	}
	/**
	 * Draw element's icon.
	 *
	 * @param {RenderingContext} ctx
	 * */
	draw_icon(ctx){
		ctx.strokeStyle = this.get_parameter('color');
		const mg = 0.2;
		ctx.beginPath();
		ctx.moveTo(0.0, 0.5);
		ctx.lineTo(mg, 0.5);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(mg, mg);
		ctx.lineTo(1.0-mg, 0.5);
		ctx.lineTo(mg, 1.0-mg);
		ctx.lineTo(mg, mg);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(1.0-mg, 0.5);
		ctx.lineTo(1.0, 0.5);
		ctx.stroke();
	}
}

export class SysBlockPassive extends SysBlockABC{
	static title = 'Passive';
	static default_pars = {
		...SysBlockABC.default_pars,
		'gain': -1,
		'noise_figure': 1,
		'part_number': "Passive",
		'p1db': 10,
		'linearity': "Ignore",
	}
	process_inputs(){
		this.inputs['noise_figure'].value = Math.abs(this.inputs['gain'].value);
		super.process_inputs();
	}
	map_input(key, input){
		super.map_input(key, input);
		if (key == 'noise_figure') input.setAttribute('disabled', true);
	}
	/**
	 * Draw element's icon.
	 *
	 * @param {RenderingContext} ctx
	 * */
	draw_icon(ctx){
		ctx.strokeStyle = this.get_parameter('color');
		const mg = 0.2;
		const h = 0.2
		ctx.beginPath();
		ctx.moveTo(0.0, 0.5);
		ctx.lineTo(mg, 0.5);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(mg, 0.5+h/2);
		ctx.lineTo(mg, 0.5-h/2);
		ctx.lineTo(1.0-mg, 0.5-h/2);
		ctx.lineTo(1.0-mg, 0.5+h/2);
		ctx.lineTo(mg, 0.5+h/2);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(1.0-mg, 0.5);
		ctx.lineTo(1.0, 0.5);
		ctx.stroke();
	}
}

export const SysBlocks = [
	SysBlockAmplifier,
	SysBlockPassive,
]
