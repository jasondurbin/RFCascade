/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 *   SysColumnSignalPowerOutIdeal
 * | SysColumnNoisePowerOut
 * | SysColumnSystemOIP2
 * | SysColumnSystemOIP3
 * | SysColumnSystemOP1dB
 * | SysColumnSystemElementCount
 * | SysColumnSystemSinglePathGain
 * | SysColumnSystemArrayGain
 * )} ColumnSystemCalculationHint
 *
 * @typedef {(
 *   typeof SysColumnSignalPowerOutIdeal
 * | typeof SysColumnNoisePowerOut
 * | typeof SysColumnSystemOIP2
 * | typeof SysColumnSystemOIP3
 * | typeof SysColumnSystemOP1dB
 * | typeof SysColumnSystemElementCount
 * | typeof SysColumnSystemSinglePathGain
 * | typeof SysColumnSystemArrayGain
 * )} ColumnSystemCalculationTypeHint
 *
 * @typedef {(
 *   'signal_power_out'
 * | 'noise_power_out'
 * | 'system_oip3'
 * | 'system_oip2'
 * | 'system_op1db'
 * | 'system_element_count'
 * | 'system_single_path_gain'
 * | 'system_array_gain'
 * )} KeySystemCalculationHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitPower, ColumnUnitGain, ColumnUnitNoiseDensity} from "../column-units.js"
import {ColumnSectionSystemCascaded} from "./column-sections.js"

export class SysColumnSystemOutput extends SysColumnABC{
	static defaults = {
		...SysColumnABC.defaults,
		'visible': false,
	}
	static type = 'system-output';
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

export class SysColumnSignalPowerOutIdeal extends SysColumnSystemOutput{
	static title = 'Signal Power Out';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'signal_power_out';
	static uindex = 101;
	static cascade = true;
	static description = "Signal power at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		block.add_cascade_parameter('snr_in', node.snr_ideal);
		const p = node.signal_power_ideal;
		node.signal_power_ideal = p*block.get_parameter('signal_power_gain');
		this.update(block, node.signal_power_ideal);
		block.add_cascade_parameter('signal_power_in', p);
		block.add_cascade_parameter('system_signal_gain_ideal', node.signal_power_ideal/node.signal_power_in);
	}
}

export class SysColumnNoisePowerOut extends SysColumnSystemOutput{
	static title = 'Noise Power Out';
	static unit = ColumnUnitNoiseDensity;
	static unit_default = 'dBm/Hz';
	static key = 'noise_power_out';
	static uindex = 102;
	static description = "Noise power at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		const p1 = block.coherent_noise_power_contribution(node);
		block.add_cascade_parameter('noise_power_in', node.noise_power);
		node.noise_power = p1;
		this.update(block, p1);
		block.add_cascade_parameter('snr_out', node.snr_ideal);

		const p2 = block.spg_noise_power_contribution(node);
		block.add_cascade_parameter('noise_power_in_spg', node.noise_power_spg);
		node.noise_power_spg = p2;
		block.add_cascade_parameter('snr_out_spg', node.snr_ideal_spg);
	}
}

export class SysColumnSystemOP1dB extends SysColumnSystemOutput{
	static defaults = {
		...SysColumnSystemOutput.defaults,
		'visible': true
	}
	static title = 'Cascaded OP1dB';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'system_op1db';
	static uindex = 104;
	static cascade = true;
	static description = "Cascaded output-referred 1-dB compression point (OP1dB) at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		const i1 = node.p1dB;
		const i2 = block.get_parameter('op1db');
		const g2 = block.get_parameter('signal_power_gain');
		let p1, p2, v;

		if (!isFinite(i1)) p1 = 0.0;
		else p1 = 1/(i1*g2);
		if (!isFinite(i2)) p2 = 0.0;
		else p2 = 1/i2;

		if (p1 == 0.0 && p2 == 0.0) v = Infinity;
		else v = 1/(p1 + p2);
		node.p1dB = v;
		this.update(block, v);
	}
}

export class SysColumnSystemOIP3 extends SysColumnSystemOutput{
	static defaults = {
		...SysColumnSystemOutput.defaults,
		'visible': true
	}
	static title = 'Cascaded OIP3';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'system_oip3';
	static uindex = 105;
	static cascade = true;
	static description = "Cascaded output-referred third order intercept point (OIP3) at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		const i1 = node.oip3;
		const i2 = block.get_parameter('oip3');
		const g2 = block.get_parameter('signal_power_gain');
		let p1, p2, v;

		if (!isFinite(i1)) p1 = 0.0;
		else p1 = 1/(i1*g2);
		if (!isFinite(i2)) p2 = 0.0;
		else p2 = 1/i2;

		if (p1 == 0.0 && p2 == 0.0) v = Infinity;
		else v = 1/(p1 + p2);
		node.oip3 = v;
		this.update(block, v);
	}
}

export class SysColumnSystemOIP2 extends SysColumnSystemOutput{
	static title = 'Cascaded OIP2';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'system_oip2';
	static uindex = 106;
	static cascade = true;
	static description = "Cascaded output-referred second order intercept point (OIP2) at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		const i1 = node.oip2;
		const i2 = block.get_parameter('oip2');
		const g2 = block.get_parameter('signal_power_gain');
		let p1, p2, v;

		if (!isFinite(i1)) p1 = 0.0;
		else p1 = 1/(i1*g2);
		if (!isFinite(i2)) p2 = 0.0;
		else p2 = 1/i2;

		if (p1 == 0.0 && p2 == 0.0) v = Infinity;
		else v = 1/(p1 + p2);
		node.oip2 = v;
		this.update(block, v);
	}
}

export class SysColumnSystemElementCount extends SysColumnSystemOutput{
	static title = 'Device Quantity';
	static unit = null;
	static key = 'system_element_count';
	static number_type = 'int';
	static uindex = 107;
	static cascade = true;
	static description = "Number of identical devices that would appear in system. This is also related to array gain.";

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		const p1 = node.element_count;
		const p2 = block.get_parameter('element_count');
		node.element_count = p1*p2;
		block.add_cascade_parameter('element_count_in', p1);
		block.add_cascade_parameter('negative_noise_figure_in', node.negative_noise_figure);
		this.update(block, node.element_count);
		node.negative_noise_figure *= block.get_parameter('negative_noise_figure');
	}
}

export class SysColumnSystemSinglePathGain extends SysColumnSystemOutput{
	static title = 'Cascaded Single Path Gain';
	static unit = ColumnUnitGain;
	static key = 'system_single_path_gain';
	static uindex = 108;
	static cascade = true;
	static description = "Cascaded single path gain (when only one element is on) at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		block.add_cascade_parameter('snr_in_spg', node.snr_ideal_spg);
		node.signal_power_spg_ideal *= block.get_parameter('single_path_gain');
		this.update(block, node.signal_power_spg_ideal/node.signal_power_in);
	}
	/** @inheritdoc @type {SysColumnSystemCascade['force_hidden']} */
	force_hidden(blocks){ return this.parent.globals.is_tx(); }
}

export class SysColumnSystemArrayGain extends SysColumnSystemOutput{
	static title = 'Cascaded Array Gain';
	static unit = ColumnUnitGain;
	static key = 'system_array_gain';
	static uindex = 109;
	static cascade = true;
	static description = "Cascaded array gain at the output of a block or system.";

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		block.add_cascade_parameter('array_gain_in', node.array_gain);
		node.array_gain *= block.get_parameter('array_gain');
		this.update(block, node.array_gain);
	}
}
