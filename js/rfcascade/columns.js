/**
 * @import { BlockHint } from "./blocks.js"
 * @import { SysCalculationNode } from "./blocks.js"
 * @import { SceneControlSystemCalc } from "../index.js"
 *
 * @typedef {SysColumnElementInput | SysColumnElementCalculated | SysColumnSystemOutput} SysColumnHint/**
 * @typedef {'noise_figure' | 'gain'} KeyInputHint
 * @typedef {'linear_power_gain' | 'linear_noise_power' | 'linear_voltage_gain' | 'noise_factor' | 'noise_temperature'} KeyOtherHint
 * @typedef {'sys_gain'} KeyCalculatedHint
 * @typedef {'attribute'} KeyAttributeHint
 * @typedef {KeyInputHint | KeyAttributeHint | KeyCalculatedHint | KeyOtherHint} KeyHintAny
 */
const formatter = new Intl.NumberFormat('en-US', {notation: 'engineering'})

export class SysColumnABC{
	static defaults = {
		'visible': true,
	}
	/**	 *
	 * Column constructor
	 *
	 * @param {SceneControlSystemCalc} parent
	 * */
	constructor(parent){
		this.parent = parent;
		this.visible = this.constructor.defaults['visible'];
		this.required = true;
	}
	get title(){ return this.constructor.title; }
	get unit(){
		const unit = this.constructor.unit;
		if (unit === undefined || unit === null) return ''
		return unit;
	}
	get parameter_key(){ return this.constructor.key; }
	get user_type(){ return this.constructor.type; }
	update(block, value){
		if (!this.visible) return;
		let s;
		if (this.constructor.formatter === undefined) s = this.parent.format_float(value);
		else s = this.constructor.formatter.format(value);
		block.cell(this.parameter_key).innerHTML = s;
	}
}
export class SysColumnElementInput extends SysColumnABC{
	static type = 'input';
}

export class SysColumnElementCalculated extends SysColumnABC{
	static type = 'device-output';

	/**
	 * Calculate element parameter.
	 *
	 * @param {BlockHint} block
	 * */
	calculate_element(block){
		this.update(block, block.get_parameter(this.parameter_key));
	 }
	/**
	 * Calculate elements' parameter.
	 *
	 * @param {Array<BlockHint>} blocks
	 * */
	calculate_elements(blocks){
		if (this.visible || this.required){
			blocks.forEach((b) => {this.calculate_element(b); })
		}
	}
}
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
	 * @param {Array<BlockHint>} blocks
	 * */
	calculate(node, blocks){throw Error("Need to overload.")}
}

export class SysColumnElementType extends SysColumnABC{
	static title = 'Type';
	static unit = null;
	static key = 'title';
	static type = 'attribute';
}

export class SysColumnElementGain extends SysColumnElementInput{
	static title = 'Gain';
	static unit = 'dB';
	static key = 'gain';
}

export class SysColumnElementNoiseFigure extends SysColumnElementInput{
	static title = 'Noise';
	static unit = 'dB';
	static key = 'noise_figure';
}

export class SysColumnSystemGain extends SysColumnSystemOutput{
	static title = 'System Gain';
	static unit = 'dB';
	static key = 'sys_gain';

	/** @inheritdoc @type {SysColumnSystemOutput['calculate']} */
	calculate(node, blocks){
		blocks.forEach((b) => {
			if (!b.enabled) return;
			node.linear_power_gain *= b.get_parameter('linear_power_gain');
			this.update(b, 10*Math.log10(node.linear_power_gain));
		});
	}
}

export class SysColumnElementLinearNoisePowerOut extends SysColumnSystemOutput{
	static title = 'Noise Power Out';
	static unit = 'W/Hz';
	static key = 'linear_noise_power';
	static formatter = formatter;

	/** @inheritdoc @type {SysColumnSystemOutput['calculate']} */
	calculate(node, blocks){
		blocks.forEach((b) => {
			if (!b.enabled) return;
			const t = b.get_parameter('noise_temperature');
			const g = b.get_parameter('linear_power_gain');
			const p =  g*(node.kb * t + node.linear_noise_power);
			node.linear_noise_power = p;
			this.update(b, p);
		});
	}
}

export class SysColumnElementLinearPowerGain extends SysColumnElementCalculated{
	static defaults = {
		...SysColumnElementCalculated.defaults,
		'visible': true,
	}
	static title = 'Power Gain';
	static unit = 'W/W';
	static key = 'linear_power_gain';
}

export class SysColumnElementLinearVoltageGain extends SysColumnElementLinearPowerGain{
	static title = 'Voltage Gain';
	static unit = 'V/V';
	static key = 'linear_voltage_gain';
}

export class SysColumnElementNoiseFactor extends SysColumnElementCalculated{
	static defaults = {
		...SysColumnElementCalculated.defaults,
		'visible': false,
	}
	static title = 'Noise Factor';
	static unit = '';
	static key = 'noise_factor';
}

export class SysColumnElementNoiseTemperature extends SysColumnElementCalculated{
	static defaults = {
		...SysColumnElementCalculated.defaults,
		'visible': true,
	}
	static title = 'Noise Temperature';
	static unit = 'K';
	static key = 'noise_temperature';
}

export const SysColumns = [
	SysColumnElementType,
	SysColumnElementGain,
	SysColumnElementNoiseFigure,
	SysColumnElementNoiseFactor,
	SysColumnElementNoiseTemperature,
	SysColumnElementLinearPowerGain,
	SysColumnElementLinearVoltageGain,

	SysColumnSystemGain,
	SysColumnElementLinearNoisePowerOut,
]
