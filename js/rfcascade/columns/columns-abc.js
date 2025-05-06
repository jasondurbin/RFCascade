/**
 * @import { SceneControlSystemCalc } from "../../index.js"
 * @import { ColumnUnitHint } from "../column-units.js"
 * @import { BlockHint } from "../blocks.js"
 */
import {SceneObjectEvent} from "../../scene/scene-abc.js"
import {ColumnSectionABC} from "./column-sections.js"

export class SysColumnABC extends SceneObjectEvent{
	static defaults = {
		'visible': true,
		'required': true,
	}
	static save_key = null;
	static input_type = null;
	static plottable = true;
	static position_fixed = false;
	static cascade = false;
	static hideable = true;
	static section = ColumnSectionABC;
	/**
	 * Column constructor
	 *
	 * @param {SceneControlSystemCalc} parent
	 * */
	constructor(parent){
		super();
		this.add_event_types('visibility-changed', 'title-changed');
		this.parent = parent;
		this.visible = this.constructor.defaults['visible'];
		this.required = this.constructor.defaults['required'];
		this._reformatWaiting = false;
		this.__forceHidden = false;
		this.addEventListener('title-changed', () => {this.update_header();})
		this.visibilitySelectors = []
	}
	/**
	 * Return column Section.
	 *
	 * @returns {typeof ColumnSectionABC}
	 * */
	get section(){ return this.constructor.section; }
	get plottable(){ return this.constructor.plottable; }
	get position_fixed(){ return this.constructor.position_fixed; }
	get hideable(){ return this.constructor.hideable; }
	get is_cascaded(){ return this.constructor.cascade; }
	get reformatWaiting(){
		if (!this.visible) return false;
		if (this.unit !== null && this.unit.changed) return true;
		return this._reformatWaiting;
	}
	get visible(){ return this._visible; }
	set visible(vis){
		this._visible = vis;
		this.trigger_event('visibility-changed', vis);
	}
	get hidden(){ return this.__forceHidden || !this._visible; }
	load_defaults(){
		for (const [k, v] of Object.entries(this.constructor.defaults)){
			this[k] = v;
		}
	}
	/**
	 * Convert block to saveable parameter.
	 *
	 * @param {BlockHint} block
	 * @returns {[String, Any]} key, value
	 * */
	static to_saveable(block){
		const itype = this.input_type;
		if (this.save_key === null) throw Error("Cannot save.");
		if (itype === null) throw Error("Missing type.");
		let v = block.get_parameter(this.key);
		if (itype == 'number') v = Number(v);
		else if (itype == 'text' || itype == 'color'){}
		else if (Array.isArray(itype)){
			let vi = -1;
			for (let i = 0; i < itype.length; i++){
				if (v == itype[i]) vi = i;
			}
			v = vi;
		}
		else throw Error(`Unknown type ${itype}.`);
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
		if (v === undefined || v === null) return [null, null, null];

		if (itype == 'number') v = Number(v);
		else if (itype == 'text' || itype == 'color'){}
		else if (Array.isArray(itype)){
			v = Number(v);
			if (v < 0 || v >= itype.length) return [null, null, null];
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
	update_header(){
		if (this.header === undefined) return;
		this.header.innerHTML = this.title;
	}
	get title(){ return this.constructor.title; }
	get unit_label(){
		if (this.unit === null){
			const unit = this.constructor.unit;
			if (unit == null || unit == undefined || unit == '') return '';
			return unit;
		}
		return this.unit.selected_unit;
	}
	get selected_unit(){
		if (this.unit === null) return null
		this.__selectedUnit = this.unit.selected_unit;
		return this.unit.selected_unit;
	}
	set selected_unit(u){
		this.__selectedUnit = u;
		if (this.unit !== null && this.unit !== undefined) this.unit.selected_unit = u;
	}
	get label(){ return `${this.title} (${this.unit_label})`;}
	/**
	 * Create a visibility selector and bind it.
	 *
	 * @param {HTMLElement} container
	 * */
	create_visibility_selector(container){
		const div = document.createElement("div");
		const chk = document.createElement("input");
		const lbl = document.createElement("label");
		const cid = this.parent.prepend + "-show-" + this.parameter_key;
		chk.id = cid;
		chk.setAttribute('name', cid);
		chk.setAttribute('type', 'checkbox');
		chk.checked = this.visible;
		lbl.setAttribute('for', cid);
		lbl.innerText = this.constructor.title;
		div.appendChild(chk);
		div.appendChild(lbl);
		container.appendChild(div);
		this.addEventListener('visibility-changed', (v) => { chk.checked = v; });
		chk.addEventListener('click', () => { this.visible = chk.checked; })
		this.visibilitySelectors.push(div);
	}
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
			const ele = this.unit.build(this.constructor.unit_default);
			if (this.__selectedUnit !== undefined) this.unit.selected_unit = this.__selectedUnit;
			container.appendChild(ele);
			this.unit.addEventListener('change', () => { this._emit_title_change(); });
			ele.setAttribute('id', this.parent.prepend + "-" + this.parameter_key + "-unit");
			this._emit_title_change();
		}
	}
	_emit_title_change(){ this.trigger_event('title-changed', this.title); }
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
	update(block, value){
		if (block.is_node) return;
		this._reformatWaiting = true;
	}
	/**
	 * Reformat columns value.
	 *
	 * @param {BlockHint} block
	 * */
	reformat(block){
		if (!this.visible) return;
		if (block.is_node && !this.is_cascaded) return;
		block.cell(this.parameter_key).innerHTML = this.value(block);
		this._reformatWaiting = false;
	}
	/**
	 * Get block's value from column.
	 *
	 * @param {BlockHint} block
	 * */
	value(block){
		return this.convert(block.get_parameter(this.parameter_key))
	}
	/**
	 * Return true if the column should be hidden based on blocks.
	 *
	 * @param {Array<BlockHint>} blocks
	 * */
	force_hidden(blocks){ return false;}
	/**
	 * Perform checks based on input blocks;
	 *
	 * @param {Array<BlockHint>} blocks
	 * */
	check(blocks){
		const fc = this.force_hidden(blocks);
		const st = fc ? 'none' : 'block';
		this.__forceHidden = fc;
		this.visibilitySelectors.forEach((v) => {
			v.style.display = st;
		})
	}
}
