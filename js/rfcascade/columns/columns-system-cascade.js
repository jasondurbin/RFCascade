/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 *   SysColumnNoiseFigureCascaded
 * | SysColumnSystemIP1dB
 * | SysColumnSystemIIP2
 * | SysColumnSystemIIP3
 * | SysColumnSystemEIRP
 * )} ColumnSystemCascadeHint
 *
 * @typedef {(
 *   typeof SysColumnNoiseFigureCascaded
 * | typeof SysColumnSystemIP1dB
 * | typeof SysColumnSystemIIP2
 * | typeof SysColumnSystemIIP3
 * | typeof SysColumnSystemEIRP
 * )} ColumnSystemCascadeTypeHint
 *
 * @typedef {'noise_figure_cascade' | 'system_ip1db' | 'system_iip2' | 'system_iip3' | 'system_eirp'} KeySystemCascadeHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitGain, ColumnUnitPower} from "../column-units.js"
import {ColumnSectionSystemCascaded} from "./column-sections.js"

export class SysColumnSystemCascade extends SysColumnABC{
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

export class SysColumnNoiseFigureCascaded extends SysColumnSystemCascade{
	static title = "Cascaded Coherent Noise Figure";
	static unit = ColumnUnitGain;
	static key = 'noise_figure_cascade';
	static uindex = 301;
	static cascade = true;

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const snr1 = node.snr_start;
		const snr2 = block.get_parameter('snr_out')/node.aperture_gain;
		this.update(block, snr1/snr2);
	}
	get title(){
		if (this.unit === undefined) return "Cascaded Coherent Noise Figure";
		if (this.unit.selected_unit == 'dB') return "Cascaded Coherent Noise Figure";
		return "Cascaded Coherent Noise Factor";
	}
}

export class SysColumnSystemIP1dB extends SysColumnSystemCascade{
	static title = "Cascaded IP1dB";
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'system_ip1db';
	static uindex = 302;
	static cascade = true;

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const p1 = block.get_parameter('system_op1db');
		const p2 = block.get_parameter('signal_gain_ideal');
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

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const p1 = block.get_parameter('system_oip3');
		const p2 = block.get_parameter('signal_gain_ideal');
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

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const p1 = block.get_parameter('system_oip2');
		const p2 = block.get_parameter('signal_gain_ideal');
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

	/** @inheritdoc @type {SysColumnSystemCascade['calculate_element']} */
	calculate_element(node, block){
		const p1 = block.get_parameter('signal_power_out');
		this.update(block, p1);
	}
}
