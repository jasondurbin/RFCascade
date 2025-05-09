/**
 * @typedef {SysBlockActive | SysBlockPassive | SysBlockNode | SysBlockCorporateCombiner | SysBlockCorporateDivider} BlockHint
 * @import {SceneControlSystemCalc} from "../index.js"
 * @import {KeyHintAny} from "./columns.js"
 */
import {draw_symbol} from "./symbols.js";
export const c_T0 = 290;


export class SysCalculationNode{
	/**
	 * Create a new system starting node.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * */
	constructor(parent){
		this.parent = parent;
		this.globals = parent.globals;
		this.signal_power_in = parent.globals.input_power();
		this.signal_power = this.signal_power_in;
		this.signal_power_ideal = this.signal_power_in;

		this.noise_power = parent.globals.noise_power();
		this.snr_start = this.snr_ideal;
		this.p1dB = Infinity;
		this.oip3 = Infinity;
		this.oip2 = Infinity;
		this.element_count = 1.0;
		this.negative_noise_figure = 1.0;
		this.array_gain = 1.0;

		this.signal_power_spg_ideal = this.signal_power_in;
		this.noise_power_spg = this.noise_power;
	}
	get snr_ideal(){return this.signal_power_ideal/this.noise_power;}
	get snr_ideal_spg(){return this.signal_power_spg_ideal/this.noise_power_spg;}
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
		}
		if (key == 'part_number') input.setAttribute('data-tooltip', "Part number is shown next to symbol on plots.");
		if (key == 'linearity') input.setAttribute('data-tooltip', "This controls whether linearity is ignored (e.g. infinite) or the input is output or input referred.");
		if (key == 'color') input.setAttribute('data-tooltip', "Change the symbol color.");
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
		if (this.linearity.startsWith("Output")){
			this.inputs['p1db'].setAttribute('data-tooltip', "This should be output P1dB (OP1dB).");
			this.inputs['ip2'].setAttribute('data-tooltip', "This should be output IP2 (OIP2).");
			this.inputs['ip3'].setAttribute('data-tooltip', "This should be output IP3 (OIP3).");
		}
		else if (this.linearity.startsWith("Input")){
			this.inputs['p1db'].setAttribute('data-tooltip', "This should be output input (IP1dB).");
			this.inputs['ip2'].setAttribute('data-tooltip', "This should be output input (IIP2).");
			this.inputs['ip3'].setAttribute('data-tooltip', "This should be output input (IIP3).");
		}
		else{
			const msg = "Linearity is ignored for this block.";
			this.inputs['p1db'].setAttribute('data-tooltip', msg);
			this.inputs['ip2'].setAttribute('data-tooltip', msg);
			this.inputs['ip3'].setAttribute('data-tooltip', msg);
		}
	}
	/**
	 * Calculate and return the coherent noise power contribution of device.
	 *
	 * @param {SysCalculationNode} node
	 * @returns {Number} Noise power contribution in W/Hz
	 * */
	coherent_noise_power_contribution(node){
		const t = this.get_parameter('noise_temperature');
		const g = this.get_parameter('electronic_gain');
		return g*(node.kb*t + node.noise_power);
	}
	/**
	 * Calculate and return the single path noise power contribution of device
	 *
	 * @param {SysCalculationNode} node
	 * @returns {Number} Noise power contribution in W/Hz
	 * */
	spg_noise_power_contribution(node){
		const t = this.get_parameter('noise_temperature_spg');
		const g = this.get_parameter('single_path_gain');
		return g*(node.kb*t + node.noise_power_spg);
	}
	process_drawings(){
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
		if (key == 'negative_noise_figure') return 1.0;
		if (key == 'signal_power_gain' || key == 'electronic_gain' || key == 'single_path_gain') return 10**(Number(this.get_parameter('gain'))/10);
		if (key == 'element_count') return 1.0;
		if (key == 'array_gain') return 1.0;
		if (key == 'noise_factor') return this.get_parameter('noise_figure_physical');
		if (key == 'noise_temperature' || key == 'noise_temperature_spg'){
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
		draw_symbol(this.get_parameter('symbol'), ctx, this);
	}
	/**
	 * Draw element's icon.
	 *
	 * @param {RenderingContext} ctx
	 * */
	draw_icon(ctx){ return draw_symbol(this.get_parameter('symbol'), ctx, this); }
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

export class SysBlockActive extends SysBlockABC{
	static title = 'Active';
	static load_index = 1;
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
		'symbol': "Amplifier",
	}
}

export class SysBlockPassive extends SysBlockABC{
	static title = 'Passive';
	static load_index = 2;
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
		'symbol': "TLine",
	}
	process_inputs(){
		this.inputs['noise_figure'].value = Math.abs(this.inputs['gain'].value);
		this.inputs['gain'].value = -Math.abs(this.inputs['gain'].value);
		super.process_inputs();
	}
	map_input(key, input){
		super.map_input(key, input);
		if (key == 'noise_figure') {
			input.setAttribute('disabled', true);
			input.setAttribute('data-tooltip', "Noise figure of a Passive type automatically |gain|.");
		}
		if (key == 'gain') input.setAttribute('data-tooltip', "Gain of a Passive type must be <= 0.");
	}
}

export class SysBlockCorporateCombiner extends SysBlockPassive{
	static title = 'Corporate Combiner';
	static load_index = 3;
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
		'symbol': "Combiner",
	}
	calculate_parameter(key){
		if (key == 'signal_power_gain') return this.get_parameter('io_count')*10**(Number(this.get_parameter('gain'))/10);
		if (key == 'electronic_gain' && this.isCorp) return 10**(Number(this.get_parameter('gain'))/10);
		if (key == 'electronic_gain' && !this.isCorp) return this.calculate_parameter('signal_power_gain');
		if ((key == 'element_count' || key == 'negative_noise_figure' || key == 'array_gain') && this.isCorp) return this.get_parameter('io_count');
		if ((key == 'element_count' || key == 'negative_noise_figure' || key == 'array_gain') && !this.isCorp) return 1.0;
		if (key == 'single_path_gain') return 1/this.get_parameter('io_count')*10**(Number(this.get_parameter('gain'))/10);
		if (key == 'noise_temperature_spg'){
			return (10**(this.get_parameter('noise_figure')/10)*this.get_parameter('io_count') - 1)*this.get_parameter('physical_temperature');
		}
		return super.calculate_parameter(key);
	}
	check_direction(){
		this.isCorp = this.parent.globals.is_rx();
		if (!this.isCorp){
			this.parent.throw_warning(`Corporate Combiner at #${this.get_parameter('index')} ('${this.get_parameter('part_number')}') requires system to be in RX. It is now treated as a coherent power combiner.`);
		}
	}
	map_input(key, input){
		super.map_input(key, input);
		if (key == 'gain') input.setAttribute('data-tooltip', "This should NOT include loss due to split.");
		if (key == 'io_count') input.setAttribute('data-tooltip', "Enter the number of legs of the combiner.");
	}
	process_inputs(){
		this.check_direction();
		super.process_inputs();
		const io = Math.max(1, this.get_parameter('io_count'));
		this['io_count'] = io;
		this.inputs['io_count'].value = io;
	}
}

export class SysBlockCorporateDivider extends SysBlockPassive{
	static title = 'Corporate Divider';
	static load_index = 4;
	static default_pars = {
		...SysBlockABC.default_pars,
		'gain': -1,
		'noise_figure': 0,
		'part_number': "Divider",
		'linearity': "Ignore",
		'p1db': Infinity,
		'ip3': Infinity,
		'ip2': Infinity,
		'temperature_offset': 0.0,
		'io_count': 2,
		'symbol': "Divider",
	}
	calculate_parameter(key){
		if (key == 'signal_power_gain' || key == 'electronic_gain' || key == 'single_path_gain') return 1/this.get_parameter('io_count')*10**(Number(this.get_parameter('gain'))/10);
		if ((key == 'element_count' || key == 'array_gain') && this.isCorp) return this.get_parameter('io_count');
		if (key == 'element_count' && !this.isCorp) return 1.0;
		return super.calculate_parameter(key);
	}
	check_direction(){
		this.isCorp = this.parent.globals.is_tx();
		if (!this.isCorp){
			this.parent.throw_warning(`Corporate Divider at #${this.get_parameter('index')} ('${this.get_parameter('part_number')}') requires system to be in TX. It is now treated as a standard power divider.`);
		}
	}
	process_inputs(){
		this.check_direction();
		super.process_inputs();
		this.noise_figure = (Math.abs(this.inputs['gain'].value) + 10*Math.log10(this.get_parameter('io_count')));
		this.inputs['noise_figure'].value = this.noise_figure.toFixed(2);
		const io = Math.max(1, this.get_parameter('io_count'));
		this['io_count'] = io;
		this.inputs['io_count'].value = io;
	}
	map_input(key, input){
		super.map_input(key, input);
		if (key == 'gain') input.setAttribute('data-tooltip', "This should NOT include loss due to split.");
		if (key == 'io_count') input.setAttribute('data-tooltip', "Enter the number of legs of the divider.");
	}
}

export class SysBlockCombiner extends SysBlockCorporateCombiner{
	static title = 'Combiner';
	static load_index = 5;
	check_direction(){ this.isCorp = false; }
}

export class SysBlockDivider extends SysBlockCorporateDivider{
	static title = 'Divider';
	static load_index = 6;
	check_direction(){ this.isCorp = false; }
}

export class SysBlockAntenna extends SysBlockABC{
	static title = 'Antenna';
	static load_index = 7;
	static default_pars = {
		...SysBlockABC.default_pars,
		'gain': 4,
		'noise_figure': 0,
		'part_number': "Antenna",
		'linearity': "Ignore",
		'p1db': Infinity,
		'ip3': Infinity,
		'ip2': Infinity,
		'temperature_offset': 0.0,
		'symbol': "Antenna",
	}
	calculate_parameter(key){
		if (key == 'electronic_gain') return 1.0;
		if (key == 'array_gain' || key == 'negative_noise_figure') return 10**(Number(this.get_parameter('gain'))/10);
		if (key == 'single_path_gain') return 1.0;
		return super.calculate_parameter(key);
	}
	process_inputs(){
		this.inputs['noise_figure'].value = 0;
		super.process_inputs();
	}
	map_input(key, input){
		super.map_input(key, input);
		if (key == 'noise_figure') input.setAttribute('disabled', true);
	}
}

export const SysBlocks = [
	SysBlockActive,
	SysBlockPassive,
	SysBlockCorporateCombiner,
	SysBlockCorporateDivider,
	SysBlockCombiner,
	SysBlockDivider,
	SysBlockAntenna,
]
