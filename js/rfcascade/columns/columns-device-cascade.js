
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
	static description = "Device's noise figure/factor contribution to system."

	/** @inheritdoc @type {SysDeviceCascaded['calculate_element']} */
	calculate_element(node, block){
		const snr1 = block.get_parameter('snr_in')/block.get_parameter('negative_noise_figure_in');
		const snr2 = block.get_parameter('snr_out')/node.negative_noise_figure;
		this.update(block, snr1/snr2);
	}
	get selector_title(){
		if (this.parent.globals.is_rx()) return "Coherent Noise Figure Contribution";
		else return "Noise Figure Contribution";
	}
	get title(){
		let pre = '';
		if (this.parent.globals.is_rx()) pre = 'Coherent '
		if (this.unit === undefined) return `${pre}Noise Figure Contribution`;
		if (this.unit.selected_unit == 'dB') return `${pre}Noise Figure Contribution`;
		return `${pre}Noise Factor Contribution`;
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
	static description = "How far from OP1dB the device is operating. If this number is negative, the device is in compression."

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

export class SysDeviceSPGNoiseFigureContribution extends SysDeviceCascaded{
	static defaults = {
		...SysColumnABC.defaults,
		'visible': false,
	}
	static title = "Single Path Noise Figure Contribution";
	static unit = ColumnUnitGain;
	static key = 'noise_figure_contribution_spg';
	static uindex = 403;
	static description = "Device's noise figure contribution when operating in single path mode (only applicable with RX mode)."

	/** @inheritdoc @type {SysDeviceCascaded['calculate_element']} */
	calculate_element(node, block){
		const snr1 = block.get_parameter('snr_in_spg');
		const snr2 = block.get_parameter('snr_out_spg');
		this.update(block, snr1/snr2);
	}
	get title(){
		if (this.unit === undefined) return "Single Path Noise Figure Contribution";
		if (this.unit.selected_unit == 'dB') return "Single Path Noise Figure Contribution";
		return "Single Path Noise Factor Contribution";
	}
	/** @inheritdoc @type {SysDeviceCascaded['force_hidden']} */
	force_hidden(blocks){ return this.parent.globals.is_tx(); }
}

export const ColumnDeviceCascade = [
	SysDeviceNoiseFigureContribution,
	SysDeviceSPGNoiseFigureContribution,
	SysDeviceBackoffP1dB,
]
