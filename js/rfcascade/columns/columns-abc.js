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
