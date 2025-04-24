/**
 * @typedef {SysBlockAmplifier | SysBlockPassive} BlockHint
 * @import {SceneControlSystemCalc} from "../index.js"
 * @import {KeyHintAny} from "./columns.js"
 */

export class SysCalculationNode{
	/**
	 * Create a new system starting node.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * */
	constructor(parent){
		this.parent = parent;
		this.linear_power_gain = 1.0;
		this.linear_noise_power = parent.globals.linear_noise_power;
	}
	get kb(){ return this.parent.globals.kb; }
}

export class SysBlockABC{
	/**
	 * Create a new system block.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * @param {Object} pars
	 * */
	constructor(parent, pars){
		this.parent = parent;
		this.cells = {};
		this.calcpars = {};
		this.cascpars = {};
		this.inputs = {};
		this.enabled = true;
	}
	/**
	 * Retrieve a parameter from a block.
	 *
	 * @param {KeyHintAny} key
	 * @param {HTMLInputElement} input
	 * */
	map_input(key, input){ this.inputs[key] = input; }
	process_inputs(){
		for (const [key, input] of Object.entries(this.inputs)){
			this[key] = input.value;
		}
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

		if (key == 'linear_voltage_gain') val = Math.sqrt(this.get_parameter('linear_power_gain'));
		else if (key == 'linear_power_gain') val = 10**(this.get_parameter('gain')/10);
		else if (key == 'noise_factor') val = 10**(this.get_parameter('noise_figure')/10);
		else if (key == 'noise_temperature') val = (this.get_parameter('noise_factor') - 1)*this.get_parameter('physical_temperature');
		else if (key == 'physical_temperature_offset') val = 0.0;
		else if (key == 'physical_temperature') val = this.get_parameter('physical_temperature_offset') + this.parent.globals.system_temperature;
		else throw Error(`Unknown parameter ${key}.`)
		this.calcpars[key] = val;
		return val;
	}
	reset_parameters(){
		this.calcpars = {};
		this.cascpars = {};
	}
	add_cascade_parameter(key, value){ this.cascpars[key] = value; }
}
export class SysBlockAmplifier extends SysBlockABC{
	static title = 'Amplifier';
	constructor(parent, pars){
		super(parent, pars);
		this.gain = 13;
		this.noise_figure = 5;
	}
}

export class SysBlockPassive extends SysBlockABC{
	static title = 'Passive';
	constructor(parent, pars){
		super(parent, pars);
		this.gain = -1;
		this.noise_figure = 1;
	}
	process_inputs(){
		super.process_inputs();
		this.inputs['noise_figure'].value = Math.abs(this.inputs['gain'].value);
	}
}

export const SysBlocks = [
	SysBlockAmplifier,
	SysBlockPassive,
]
