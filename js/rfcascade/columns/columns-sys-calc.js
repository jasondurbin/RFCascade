/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 * SysColumnSystemOutput
 * | SysColumnSystemLinearSignalPowerOutIdeal
 * | SysColumnElementLinearNoisePowerOut
 * | SysColumnSystemNoiseFigureContribution
 * | SysColumnSystemNoiseFigureCascaded
 * )} ColumnSysCalcHint
 *
 * @typedef {'signal_power_out' | 'noise_power_out' | 'noise_figure_contribution' | 'noise_figure_cascade'} KeySysCalcHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitPower, ColumnUnitGain} from "../column-units.js"

export class SysColumnSystemOutput extends SysColumnABC{
	static type = 'system-output';

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

export class SysColumnSystemLinearSignalPowerOutIdeal extends SysColumnSystemOutput{
	static title = 'Signal Power Out';
	static unit = ColumnUnitPower;
	static key = 'signal_power_out';
	static uindex = 101;
	static cascade = true;

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		block.add_cascade_parameter('snr_in', node.snr_ideal);
		const p = node.signal_power_ideal;
		node.signal_power_ideal = p*block.get_parameter('power_gain');
		this.update(block, node.signal_power_ideal);
		block.add_cascade_parameter('signal_power_in', p);
	}
}

export class SysColumnElementLinearNoisePowerOut extends SysColumnSystemOutput{
	static title = 'Noise Power Out';
	static unit = 'W/Hz';
	static key = 'noise_power_out';
	static uindex = 102;

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		const t = block.get_parameter('noise_temperature');
		const g = block.get_parameter('power_gain');
		const p =  g*(node.kb * t + node.noise_power);
		block.add_cascade_parameter('noise_power_in', node.noise_power);
		node.noise_power = p;
		this.update(block, p);
		block.add_cascade_parameter('snr_out', node.snr_ideal);
	}
}

export class SysColumnSystemGain extends SysColumnSystemOutput{
	static title = 'System Gain';
	static unit = 'dB';
	static key = 'system_gain_ideal';
	static uindex = 103;

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		node.power_gain *= block.get_parameter('power_gain');
		this.update(b, 10*Math.log10(node.power_gain));
	}
}

export class SysColumnSystemNoiseFigureContribution extends SysColumnSystemOutput{
	static unit = ColumnUnitGain;
	static key = 'noise_figure_contribution';
	static uindex = 104;

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		const snr1 = block.get_parameter('snr_in');
		const snr2 = block.get_parameter('snr_out');
		this.update(block, snr1/snr2);
	}
	create_unit(container){
		super.create_unit(container);
		this.unit.addEventListener('change', () => {
			this.update_header();
		})
	}
	get title(){
		if (this.unit === undefined) return "Noise Figure Contribution";
		if (this.unit.selected_unit == 'dB') return "Noise Figure Contribution";
		return "Noise Factor Contribution";
	}
}

export class SysColumnSystemNoiseFigureCascaded extends SysColumnSystemOutput{
	static unit = ColumnUnitGain;
	static key = 'noise_figure_cascade';
	static uindex = 105;
	static cascade = true;

	/** @inheritdoc @type {SysColumnSystemOutput['calculate_element']} */
	calculate_element(node, block){
		const snr1 = node.snr_start;
		const snr2 = block.get_parameter('snr_out');
		this.update(block, snr1/snr2);
	}
	create_unit(container){
		super.create_unit(container);
		this.unit.addEventListener('change', () => {
			this.update_header();
		})
	}
	get title(){
		if (this.unit === undefined) return "Cascaded Noise Figure";
		if (this.unit.selected_unit == 'dB') return "Cascaded Noise Figure";
		return "Cascaded Noise Factor";
	}
}

export const ColumnSysCalc = [
	SysColumnSystemLinearSignalPowerOutIdeal,
	SysColumnElementLinearNoisePowerOut,
	SysColumnSystemNoiseFigureCascaded,
	SysColumnSystemNoiseFigureContribution,
]
