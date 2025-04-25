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
for (const [pre, fact] of Object.entries(SIPrepend)) SIConverters[pre] = (v) => (v*10**(-fact));
export function SIConvertersUnit(u){
	const unitCallers = {};
	for (const [pre, func] of Object.entries(SIConverters)) unitCallers[pre + u] = func;
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
		this._changed = true;
	}
	/**
	 * Build the unit dropdown.
	 *
	 * @returns {HTMLSelectElement} container
	 * */
	build(){
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
			if (u == this.defaultUnit) opt.setAttribute('selected', true);
			sel.appendChild(opt);
		}
		sel.addEventListener('change', () => {
			this._changed = true;
		})
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
	/**
	 * Convert value to selected unit.
	 *
	 * @param {Number} value
	 * @returns {Number}
	 * */
	convert(value){
		if (value == Infinity || value == -Infinity) return Infinity;
		if (this.changed) this.__converter = this.unitCallers[this.selected_unit];
		return this.__converter(value);
	}
	config(){}
}

export class ColumnUnitPower extends ColumnUnitABC{
	static baseUnit = 'W';
	static unit_definitions = {
		...SIConvertersUnit('W'),
		'dBm': (v) => 10*Math.log10(v*1000),
		'dBW': (v) => 10*Math.log10(v),
	}
	get allowEngineeringNotation(){ return true; }
}

export class ColumnUnitTemperature extends ColumnUnitABC{
	static baseUnit = 'K';
	static unit_definitions = {
		'K': (v) => v,
		'C': (v) => v - 273.15,
	}
	get allowEngineeringNotation(){ return true; }
}

export class ColumnUnitPowerGain extends ColumnUnitABC{
	static baseUnit = 'dB';
	static unit_definitions = {
		'dB': (v) => 10*Math.log10(v),
		'W/W': (v) => v,
		'V/V': (v) => Math.sqrt(v),
	}
	get allowEngineeringNotation(){ return true; }
}

export class ColumnUnitGain extends ColumnUnitABC{
	static baseUnit = 'dB';
	static unit_definitions = {
		'(unitless)': (v) => v,
		'dB': (v) => 10*Math.log10(v),
	}
	get allowEngineeringNotation(){ return true; }
}

export function ColumnUnitConfigurator(kls, ...args){
	const _caller = (...dargs) => {
		const u = kls(...dargs);
		u.config(...args);
		return u;
	}
	return _caller
}
