/**
 * @import { SceneControlSystemCalc } from "../../index.js"
 * @import { ColumnUnitHint } from "../column-units.js"
 * @import { BlockHint } from "../blocks.js"
 */

export class SysColumnABC{
	static defaults = {
		'visible': true,
		'required': true,
	}
	static save_key = null;
	static input_type = null;
	/**
	 * Column constructor
	 *
	 * @param {SceneControlSystemCalc} parent
	 * */
	constructor(parent){
		this.parent = parent;
		this.visible = this.constructor.defaults['visible'];
		this.required = this.constructor.defaults['required'];
		this._reformatWaiting = false
	}
	get reformatWaiting(){
		if (!this.visible) return false;
		if (this.unit !== null && this.unit.changed) return true;
		return this._reformatWaiting;
	}
	/**
	 * Convert block to saveable parameter.
	 *
	 * @param {BlockHint} block
	 * @returns {[String, Any]}
	 * */
	static to_saveable(block){
		const itype = this.input_type;
		if (this.save_key === null) throw Error("Cannot save.");
		if (itype === null) throw Error("Missing type.");
		let v = block.get_parameter(this.key);
		if (itype == 'number') v = Number(v);
		else if (itype == 'text'){}
		else if (Array.isArray(itype)){
			let vi = -1;
			for (let i = 0; i < itype.length; i++){
				if (v == itype[i]) vi = i;
			}
			v = vi;
		}
		else throw Error(`Unknown type ${itype}.`)
		return [this.save_key, v];
	}
	/**
	 * Attempt to find my saveable parameter from input.
	 *
	 * @param {Object} pars
	 * @returns {[String, Any]}
	 * */
	static from_saveable(pars){
		const itype = this.input_type;
		if (this.save_key === null) throw Error("Cannot load.");
		if (itype === null) throw Error("Missing type.");
		let v = pars[this.save_key];
		if (v === undefined || v === null) return [null, null];

		if (itype == 'number') v = Number(v);
		else if (itype == 'text'){}
		else if (Array.isArray(itype)){
			v = Number(v);
			if (v < 0 || v >= itype.length) return [null, null];
			v = itype[v];
		}
		else throw Error(`Unknown type ${itype}.`)
		return [this.key, v];
	}
	/**
	 * Create unit for column.
	 *
	 * @param {HTMLTableSectionElement} header
	 * */
	bind_header(header){
		this.header = header;
		this.update_header();
	}
	update_header(){this.header.innerHTML = this.title}
	get title(){ return this.constructor.title; }
	/**
	 * Create unit for column.
	 *
	 * @param {HTMLElement} container
	 * */
	create_unit(container){
		const unit = this.constructor.unit;
		/** @type {ColumnUnitHint | null} */
		this.unit = null;
		if (unit == null || unit == undefined || unit == '') return;
		else if (typeof(unit) === 'string') container.innerHTML = unit;
		else{
			this.unit = new unit(this);
			const ele = this.unit.build();
			container.appendChild(ele);
		}
	}
	/**
	 * Convert value to selected unit and format.
	 *
	 * @param {Number} value
	 * @returns {String}
	 * */
	convert(value){
		let allowEng = true;
		if (this.unit !== null){
			value = this.unit.convert(value);
			allowEng = this.unit.allowEngineeringNotation;
		}
		return this.parent.format_float(value, allowEng);
	}
	get parameter_key(){ return this.constructor.key; }
	get column_type(){ return this.constructor.type; }
	update(block, value){ this._reformatWaiting = true; }
	/**
	 * Reformat columns value.
	 *
	 * @param {BlockHint} block
	 * */
	reformat(block){
		if (!this.visible) return;
		const value = block.get_parameter(this.parameter_key);
		block.cell(this.parameter_key).innerHTML = this.convert(value);
		this._reformatWaiting = false;
	}
}
