
/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 *   SysDeviceNoiseFigureContribution
 * | SysDeviceBackoffP1dB
 * )} ColumnDeviceCascadeHint
 *
 * @typedef {(
 *   typeof SysDeviceNoiseFigureContribution
 * | typeof SysDeviceBackoffP1dB
 * )} ColumnDeviceCascadeTypeHint
 *
 * @typedef {'noise_figure_contribution'} KeyDeviceCascadeHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitGain, ColumnUnitPowerGain} from "../column-units.js"
import {ColumnSectionDeviceCalculated} from "./column-sections.js"

export class SysDeviceCascaded extends SysColumnABC{
	static type = 'device-cascade';
	static section = ColumnSectionDeviceCalculated;

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
	calculate_element(node, block){throw Error("Need to overload.")}
}

export class SysDeviceNoiseFigureContribution extends SysDeviceCascaded{
	static title = "Coherent Noise Figure Contribution";
	static unit = ColumnUnitGain;
	static key = 'noise_figure_contribution';
	static uindex = 401;

	/** @inheritdoc @type {SysDeviceCascaded['calculate_element']} */
	calculate_element(node, block){
		const snr1 = block.get_parameter('snr_in')/block.get_parameter('aperture_gain_in');
		const snr2 = block.get_parameter('snr_out')/node.aperture_gain;
		this.update(block, snr1/snr2);
	}
	get title(){
		if (this.unit === undefined) return "Coherent Noise Figure Contribution";
		if (this.unit.selected_unit == 'dB') return "Coherent Noise Figure Contribution";
		return "Coherent Noise Factor Contribution";
	}
}

export class SysDeviceBackoffP1dB extends SysDeviceCascaded{
	static defaults = {
		...SysColumnABC.defaults,
		'visible': false,
	}
	static title = "Backoff from OP1dB";
	static unit = ColumnUnitPowerGain;
	static key = 'backoff_from_p1db';
	static uindex = 402;

	/** @inheritdoc @type {SysDeviceCascaded['calculate_element']} */
	calculate_element(node, block){
		const v1 = block.get_parameter('op1db');
		if (isFinite(v1)){
			const v2 = block.get_parameter('signal_power_out');
			this.update(block, v1/v2);
		}
		else this.update(block, v1);
	}
}

export const ColumnDeviceCascade = [
	SysDeviceNoiseFigureContribution,
	SysDeviceBackoffP1dB,
]
