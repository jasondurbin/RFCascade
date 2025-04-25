/**
 * @typedef {(
 * 	 SysColumnElementInput
 * | SysColumnElementGain
 * | SysColumnElementNoiseFigure
 * | SysColumnElementPartNumber
 * | SysColumnElementP1dB
 * | SysColumnElementLinearity
 * )} ColumnEleInputHint
 *
 * @typedef {'gain' | 'noise_figure' | 'part_number' | 'p1db' | 'linearity'} KeyEleInputHint
*/
import { SysColumnABC } from "./columns-abc.js"

export class SysColumnElementInput extends SysColumnABC{
	static type = 'input';
	static input_type = 'number';
	get input_type(){ return this.constructor.input_type; }
}

export class SysColumnElementGain extends SysColumnElementInput{
	static title = 'Nominal Gain';
	static unit = 'dB';
	static key = 'gain';
	static save_key = 'g';
}

export class SysColumnElementNoiseFigure extends SysColumnElementInput{
	static title = 'Nominal Noise Figure';
	static unit = 'dB';
	static key = 'noise_figure';
	static save_key = 'n';
}

export class SysColumnElementPartNumber extends SysColumnElementInput{
	static title = 'Part Number';
	static unit = '';
	static key = 'part_number';
	static input_type = 'text';
	static save_key = 'p';
}

export class SysColumnElementP1dB extends SysColumnElementInput{
	static title = 'Nominal P1dB';
	static unit = 'dBm';
	static key = 'p1db';
	static save_key = '1';
}

export class SysColumnElementLinearity extends SysColumnElementInput{
	static title = 'Linearity';
	static unit = '';
	static key = 'linearity';
	static input_type = ['Ignore', 'Output Referred', 'Input Referred'];
	static save_key = 'l';
}

export const ColumnEleInput = [
	SysColumnElementPartNumber,
	SysColumnElementGain,
	SysColumnElementNoiseFigure,
	SysColumnElementLinearity,
	SysColumnElementP1dB,
]
