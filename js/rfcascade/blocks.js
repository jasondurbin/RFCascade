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
		this.signal_power_in = parent.globals.input_power();
		this.signal_power = this.signal_power_in;
		this.signal_power_ideal = this.signal_power_in;
		this.noise_power = parent.globals.noise_power();
		this.snr_start = this.snr_ideal;
		this.p1dB = Infinity;
		this.oip3 = Infinity;
		this.oip2 = Infinity;
		this.aperture_gain = 1.0;
	}
	get snr_ideal(){return this.signal_power_ideal/this.noise_power;}
	get kb(){ return this.parent.globals.kb(); }
}

export class SysBlockABC{
	static is_node = false;
	static default_pars = {
		'color': "#000",
		'io_count': NaN,
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
		if (key == 'io_count'){
			if (isNaN(this.constructor.default_pars['io_count'])) input.style.display = 'none';
			else{
				input.setAttribute('min', 1);
				input.setAttribute('step', 1);
			}
		} ;
	}
	process_inputs(){
		for (const [key, input] of Object.entries(this.inputs)){
			let v = input.value;
			if (input.getAttribute('type') == 'number') v = Number(v)
			this[key] = v;
		}
		let lshow = this.linearity == 'Ignore' ? 'none': 'inline';
		this.inputs['p1db'].style.display = lshow;
		this.inputs['ip2'].style.display = lshow;
		this.inputs['ip3'].style.display = lshow;
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
		val = this.calcpars[key];
		if (val !== undefined && val !== null) return val;
		val = this.cascpars[key];
		if (val !== undefined && val !== null) return val;

		val = this.calculate_parameter(key);
		this.calcpars[key] = val;
		return val;
	}
	calculate_parameter(key){
		const _gain_log = () => {
			return 10*Math.log10(this.get_parameter('signal_power_gain'))
		}
		if (key == 'signal_power_gain' || key == 'noise_power_gain') return 10**(Number(this.get_parameter('gain'))/10);
		if (key == 'aperture_gain') return 1.0;
		if (key == 'noise_factor') return this.get_parameter('noise_figure_physical');
		if (key == 'noise_temperature'){
			return (10**(this.get_parameter('noise_figure')/10) - 1)*this.get_parameter('physical_temperature');
		}
		if (key == 'noise_figure_physical') return 1.0 + this.get_parameter('noise_temperature')/c_T0;
		if (key == 'physical_temperature_offset') return this.get_parameter('temperature_offset');
		if (key == 'physical_temperature') return this.get_parameter('physical_temperature_offset') + this.parent.globals.system_temperature();
		if (key == 'op1db'){
			const d = this.get_parameter('linearity');
			if (d == 'Ignore') return Infinity;
			else{
				let val = Number(this.get_parameter('p1db'));
				if (d == 'Input Referred') val += _gain_log() - 1;
				return 10**((val - 30)/10);
			}
		}
		if (key == 'ip1db'){
			const o = this.get_parameter('op1db');
			if (!isFinite(o)) return Infinity;
			else return 10**((10*Math.log10(o) - _gain_log() + 1)/10);
		}
		if (key.startsWith("oip")){
			const d = this.get_parameter('linearity');
			const s = key[key.length - 1];
			if (d == 'Ignore') return Infinity;
			else{
				let val = Number(this.get_parameter('ip' + s));
				if (d == 'Input Referred') val += _gain_log();
				return 10**((val - 30)/10);
			}
		}
		if (key.startsWith("iip")){
			const s = key[key.length - 1];
			const o = this.get_parameter('oip' + s);
			if (!isFinite(o)) return Infinity;
			return 10**((10*Math.log10(o) - _gain_log())/10);
		}
		if (key == 'system_ip1db'){
			const o = this.get_parameter('system_ip1db');
			if (!isFinite(o)) return Infinity;
			return 10**((10*Math.log10(o) - _gain_log() + 1)/10);
		}
		throw Error(`Unknown parameter ${key}.`)
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
		'ip2': Infinity,
		'ip3': Infinity,
		'linearity': "Ignore",
		'temperature_offset': 0.0,
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
		'ip3': 20,
		'ip2': 30,
		'linearity': "Output Referred",
		'temperature_offset': 0.0,
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
		'linearity': "Ignore",
		'p1db': Infinity,
		'ip3': Infinity,
		'ip2': Infinity,
		'temperature_offset': 0.0,
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

export class SysBlockCombiner extends SysBlockPassive{
	static title = 'Combiner';
	static default_pars = {
		...SysBlockABC.default_pars,
		'gain': -1,
		'noise_figure': 1,
		'part_number': "Combiner",
		'linearity': "Ignore",
		'p1db': Infinity,
		'ip3': Infinity,
		'ip2': Infinity,
		'temperature_offset': 0.0,
		'io_count': 2,
	}
	calculate_parameter(key){
		if (key == 'signal_power_gain') return this.get_parameter('io_count')*10**(Number(this.get_parameter('gain'))/10);
		if (key == 'noise_power_gain') return 10**(Number(this.get_parameter('gain'))/10);
		if (key == 'aperture_gain') return this.get_parameter('io_count');
		return super.calculate_parameter(key);
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
	SysBlockCombiner,
]
