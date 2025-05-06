/**
 * @import {SysColumnHint} from "./columns.js"
 *
 * @typedef {ColumnUnitABC | ColumnUnitPower} ColumnUnitHint
 */

export const SIPrepend = {
	'p': -12,
	'n': -9,
	'u': -6,
	'm': -3,
	'': 0,
	'k': 3,
	'M': 6,
	'G': 9,
	'T': 12,
};

export const SIConverters = {};
for (const [pre, fact] of Object.entries(SIPrepend)) SIConverters[pre] = [(v) => (v*10**(-fact)), (v) => (v*10**(fact))];
export function SIConvertersUnit(u){
	const unitCallers = {};
	for (const [pre, func] of Object.entries(SIConverters)) unitCallers[pre + u] = func;
	return unitCallers
}
export function SIConvertersUnitPositive(u){
	const unitCallers = {};
	for (const [pre, func] of Object.entries(SIConverters)){
		if (SIPrepend[pre] < 0) continue;
		unitCallers[pre + u] = func;
	}
	return unitCallers
}

export class ColumnUnitABC{
	/**
	 * Create a column unit handler
	 *
	 * @param {SysColumnHint} col
	 * */
	constructor(col, defaultUnit){
		this.col = col;
		if (defaultUnit === undefined) defaultUnit = this.constructor.baseUnit;
		this.defaultUnit = defaultUnit;
		this.__converter = null;
		this.__inverter = null;
		this._changed = true;
	}
	/**
	 * Build the unit dropdown.
	 *
	 * @param {String} [newDefaultUnit] Default unit (if different than preferred).
	 * */
	build(newDefaultUnit){
		if (newDefaultUnit === undefined) newDefaultUnit = this.defaultUnit;
		else this.defaultUnit = newDefaultUnit;
		const sel = document.createElement('select');
		let unitCallers = this.constructor.unit_definitions;

		this.selector = sel;
		if (unitCallers === undefined){
			unitCallers = SIConvertersUnit(this.constructor.baseUnit);
		}
		this.unitCallers = unitCallers;

		for (const u of Object.keys(unitCallers)){
			const opt = document.createElement('option');
			opt.innerHTML = u;
			opt.setAttribute('data-unit', u);
			if (u == newDefaultUnit) opt.setAttribute('selected', true);
			sel.appendChild(opt);
		}
		sel.addEventListener('change', () => { this._changed = true; })
		return sel;
	}
	addEventListener(k, cb){ this.selector.addEventListener(k, cb); }
	get changed(){ return this.__converter === null || this._changed; }
	get allowEngineeringNotation(){ return this.constructor.baseUnit == this.selected_unit; }
	/**
	 * Return selected unit
	 *
	 * @returns {String}
	 * */
	get selected_unit(){
		if (this._changed){
			this.__selected_unit = this.defaultUnit;
			for (let i = 0; i < this.selector.length; i++){
				const sel = this.selector[i];
				if (!sel.selected) continue;
				this.__selected_unit = sel.innerHTML;
			}
			this.__converter = null;
			this._changed = false;
		}
		return this.__selected_unit;
	}
	set selected_unit(u){
		for (let i = 0; i < this.selector.length; i++){
			const sel = this.selector[i];
			if (sel.innerHTML != u) continue;
			sel.selected = true;
		}
		this._changed = true;
	}
	_check_converters(){ if (this.changed) [this.__converter, this.__inverter] = this.unitCallers[this.selected_unit]; }
	/**
	 * Convert value to selected unit.
	 *
	 * @param {Number} value
	 * @returns {Number}
	 * */
	convert(value){
		this._check_converters();
		if (value == Infinity || value == -Infinity) return Infinity;
		return this.__converter(value);
	}
	/**
	 * Convert value frpm selected unit.
	 *
	 * @param {Number} value
	 * @returns {Number}
	 * */
	convert_from(value){
		this._check_converters();
		if (value == Infinity || value == -Infinity) return Infinity;
		return this.__inverter(value);
	}
}

export class ColumnUnitPower extends ColumnUnitABC{
	static baseUnit = 'W';
	static unit_definitions = {
		...SIConvertersUnit('W'),
		'dBm': [(v) => 10*Math.log10(v*1000), (v) => 10**((v-30)/10)],
		'dBW': [(v) => 10*Math.log10(v), 	  (v) => 10**(v/10)],
	}
	get allowEngineeringNotation(){ return true; }
}

export class ColumnUnitTemperature extends ColumnUnitABC{
	static baseUnit = 'K';
	static unit_definitions = {
		'K': [(v) => v, 			(v) => v],
		'C': [(v) => v - 273.15, 	(v) => v + 273.15],
	}
	get allowEngineeringNotation(){ return true; }
}

export class ColumnUnitFrequency extends ColumnUnitABC{
	static baseUnit = 'Hz';
	static unit_definitions = SIConvertersUnitPositive('Hz')
	get allowEngineeringNotation(){ return true; }
}

export class ColumnUnitPowerGain extends ColumnUnitABC{
	static baseUnit = 'dB';
	static unit_definitions = {
		'dB':  [(v) => 10*Math.log10(v), (v) => 10**(v/10)],
		'W/W': [(v) => v, 				 (v) => v],
		'V/V': [(v) => Math.sqrt(v), 	 (v) => v**2],
	}
	get allowEngineeringNotation(){ return true; }
}

export class ColumnUnitGain extends ColumnUnitABC{
	static baseUnit = 'dB';
	static unit_definitions = {
		'unitless': [(v) => v, 				  (v) => v],
		'dB': 		[(v) => 10*Math.log10(v), (v) => 10**(v/10)],
	}
	get allowEngineeringNotation(){ return true; }
}

export class ColumnUnitNoiseDensity extends ColumnUnitABC{
	static baseUnit = 'dBm/Hz';
	static unit_definitions = {
		'W/Hz': 	[(v) => v, 				  	   (v) => v],
		'dBm/Hz': 	[(v) => 10*Math.log10(v) + 30, (v) => 10**((v-30)/10)],
	}
	get allowEngineeringNotation(){ return true; }
}
