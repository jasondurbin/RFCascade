/**
 * @typedef {(
 * 	 SysColumnElementInput
 * | SysColumnElementGain
 * | SysColumnElementNoiseFigure
 * | SysColumnElementPartNumber
 * )} ColumnEleInputHint
 *
 * @typedef {'gain' | 'noise_figure', 'part_number'} KeyEleInputHint
*/
import { SysColumnABC } from "./columns-abc.js"

export class SysColumnElementInput extends SysColumnABC{
	static type = 'input';
	static input_type = 'number';
	get input_type(){ return this.constructor.input_type; }
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
export class SysColumnElementPartNumber extends SysColumnElementInput{
	static title = 'Part Number';
	static unit = '';
	static key = 'part_number';
	static input_type = 'string';
}

export const ColumnEleInput = [
	SysColumnElementPartNumber,
	SysColumnElementGain,
	SysColumnElementNoiseFigure
]
