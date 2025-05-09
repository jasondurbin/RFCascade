/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 *   SysColumnSystemNoiseFigure
 * | SysColumnSystemIP1dB
 * | SysColumnSystemIIP2
 * | SysColumnSystemIIP3
 * | SysColumnSystemEIRP
 * | SysColumnSystemElectronicGain
 * | SysColumnSystemNoiseTemperature
 * | SysColumnSystemGoverT
 * | SysColumnSystemSPGNoiseFigure
 * )} ColumnSystemCascadeHint
 *
 * @typedef {(
 *   typeof SysColumnSystemNoiseFigure
 * | typeof SysColumnSystemIP1dB
 * | typeof SysColumnSystemIIP2
 * | typeof SysColumnSystemIIP3
 * | typeof SysColumnSystemEIRP
 * | typeof SysColumnSystemElectronicGain
 * | typeof SysColumnSystemNoiseTemperature
 * | typeof SysColumnSystemGoverT
 * | typeof SysColumnSystemSPGNoiseFigure
 * )} ColumnSystemCascadeTypeHint
 *
 * @typedef {(
 *   'system_noise_factor'
 * | 'system_ip1db'
 * | 'system_iip2'
 * | 'system_iip3'
 * | 'system_eirp'
 * | 'system_g_over_t'
 * | 'system_electronic_gain'
 * | 'system_noise_temperature'
 * | 'system_g_over_t'
 * | 'system_noise_factor_spg'
 * )} KeySystemCascadeHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitGain, ColumnUnitPower, ColumnUnitTemperature, ColumnUnitGoverT} from "../column-units.js"
import {ColumnSectionSystemCascaded} from "./column-sections.js"

export class SysColumnSystemCascade extends SysColumnABC{
	static defaults = {
		...SysColumnABC.defaults,
		'visible': false,
	}
	static type = 'system-cascade';
	static section = ColumnSectionSystemCascaded;

	update(block, value){
		block.add_cascade_parameter(this.parameter_key, value);
		super.update(block, value);
	}
	/**
	 * Calculate column.
	 *
	 * @param {SysCalculationNode} node
	 * @param {BlockHint} block
	 * */
	calculate_element(node, block){ throw Error("Need to overload."); }
}

export class SysColumnSystemNoiseFigure extends SysColumnSystemCascade{
	static defaults = {
		...SysColumnSystemCascade.defaults,
		'visible': true
	}
	static title = "Cascaded Coherent Noise Figure";
	static unit = ColumnUnitGain;
	static key = 'system_noise_factor';
	static uindex = 301;
	static cascade = true;
	static description = "Cascaded noise figure/factor at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const snr1 = node.snr_start;
		const snr2 = block.get_parameter('snr_out')/node.negative_noise_figure;
		this.update(block, snr1/snr2);
	}
	get selector_title(){
		if (this.parent.globals.is_rx()) return "Cascaded Coherent Noise Figure";
		else return "Cascaded Noise Figure";
	}
	get title(){
		let pre = '';
		if (this.parent.globals.is_rx()) pre = 'Coherent '
		if (this.unit === undefined) return `Cascaded ${pre}Noise Figure`;
		if (this.unit.selected_unit == 'dB') return `Cascaded ${pre}Noise Figure`;
		return `Cascaded ${pre}Noise Factor`;
	}
}

export class SysColumnSystemIP1dB extends SysColumnSystemCascade{
	static title = "Cascaded IP1dB";
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'system_ip1db';
	static uindex = 302;
	static cascade = true;
	static description = "Cascaded input-referred 1-dB compression point (IP1dB) at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const p1 = block.get_parameter('system_op1db');
		const p2 = block.get_parameter('system_signal_gain_ideal');
		if (!isFinite(p1)) this.update(block, Infinity);
		else this.update(block, 10**((10*Math.log10(p1) + 1 - 10*Math.log10(p2))/10));
	}
}

export class SysColumnSystemIIP3 extends SysColumnSystemCascade{
	static title = "Cascaded IIP3";
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'system_iip3';
	static uindex = 303;
	static cascade = true;
	static description = "Cascaded input-referred third order intercept point (IIP3) at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const p1 = block.get_parameter('system_oip3');
		const p2 = block.get_parameter('system_signal_gain_ideal');
		if (!isFinite(p1)) this.update(block, Infinity);
		else this.update(block, 10**((10*Math.log10(p1) - 10*Math.log10(p2))/10));
	}
}

export class SysColumnSystemIIP2 extends SysColumnSystemCascade{
	static title = "Cascaded IIP2";
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'system_iip2';
	static uindex = 304;
	static cascade = true;
	static description = "Cascaded input-referred second order intercept point (IIP2) at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const p1 = block.get_parameter('system_oip2');
		const p2 = block.get_parameter('system_signal_gain_ideal');
		if (!isFinite(p1)) this.update(block, Infinity);
		else this.update(block, 10**((10*Math.log10(p1) - 10*Math.log10(p2))/10));
	}
}

export class SysColumnSystemEIRP extends SysColumnSystemCascade{
	static title = "Cascaded EIRP";
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'system_eirp';
	static uindex = 305;
	static cascade = true;
	static description = "Cascaded effective isotropic radiated power at the output of a block or system. Only available in TX mode.";

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const p = block.get_parameter('signal_power_out');
		const c = block.get_parameter('system_element_count');
		const g = block.get_parameter('system_array_gain');
		this.update(block, p*c*g);
	}
	/** @inheritdoc @type {SysColumnSystemCascade['force_hidden']} */
	force_hidden(blocks){ return this.parent.globals.is_rx(); }
}

export class SysColumnSystemElectronicGain extends SysColumnSystemCascade{
	static title = 'Cascaded Electronic Gain';
	static unit = ColumnUnitGain;
	static key = 'system_electronic_gain';
	static uindex = 306;
	static cascade = true;
	static description = "Cascaded electronic gain at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const p1 = block.get_parameter('system_signal_gain_ideal');
		this.update(block, p1/node.negative_noise_figure);
	}
	/** @inheritdoc @type {SysColumnSystemCascade['force_hidden']} */
	force_hidden(blocks){ return this.parent.globals.is_tx(); }
}

export class SysColumnSystemNoiseTemperature extends SysColumnSystemCascade{
	static title = 'Cascaded Noise Temperature';
	static unit = ColumnUnitTemperature;
	static key = 'system_noise_temperature';
	static uindex = 307;
	static cascade = true;
	static description = "Cascaded noise temperature at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const nf = block.get_parameter('system_noise_factor');
		const t0 = node.globals.system_temperature()
		this.update(block, t0*(nf - 1));
	}
}

export class SysColumnSystemGoverT extends SysColumnSystemCascade{
	static title = 'Cascaded G/T';
	static unit = ColumnUnitGoverT;
	static unit_default = "dB/K";
	static key = 'system_g_over_t';
	static uindex = 308;
	static cascade = true;
	static description = "Cascaded G/T ('g over t' or 'gain over temperature') at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const t = block.get_parameter('system_noise_temperature');
		const g = block.get_parameter('system_element_count');
		this.update(block, g/t);
	}
}

export class SysColumnSystemSPGNoiseFigure extends SysColumnSystemCascade{
	static title = "Cascaded Single Path Noise Figure";
	static unit = ColumnUnitGain;
	static key = 'system_noise_factor_spg';
	static uindex = 309;
	static cascade = true;
	static description = "Cascaded single path gain at the output of a block or system. Only available in RX mode.";

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const snr1 = node.snr_start;
		const snr2 = block.get_parameter('snr_out_spg');
		this.update(block, snr1/snr2);
	}
	get title(){
		if (this.unit === undefined) return "Cascaded Single Path Noise Figure";
		if (this.unit.selected_unit == 'dB') return "Cascaded Single Path Noise Figure";
		return "Cascaded Single Path Noise Factor";
	}
	/** @inheritdoc @type {SysColumnSystemCascade['force_hidden']} */
	force_hidden(blocks){ return this.parent.globals.is_tx(); }
}
