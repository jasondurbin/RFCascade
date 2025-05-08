import {SceneControl} from "../scene/scene-abc.js";
import {ColumnUnitTemperature, ColumnUnitFrequency, ColumnUnitPower} from "./column-units.js";
/**
 * @import { SceneControlSystemCalc } from "../index.js"
 * */

export const c_boltzmann =  1.380649*(10**-23);

export class SceneSystemGlobals extends SceneControl{
	/**
	 * Create global scene for System simulator.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * */
	constructor(parent){
		super(parent, []);
		this.vars = {};
		this.units = {};
	}
	static autoUpdateURL = false;
	kb(){ return c_boltzmann*this.bandwidth(); }
	noise_power(){ return this.kb()*this.noise_temperature_input(); }
	/**
	 * Return system temperature in K.
	 *
	 * @returns {Number} Temperature in K
	 * */
	system_temperature(){ throw Error("Should be overriden."); }
	/**
	 * Return system bandwidth in Hz.
	 *
	 * @returns {Number} Bandwidth in Hz
	 * */
	bandwidth(){ throw Error("Should be overriden."); }
	/**
	 * Return system input power in W.
	 *
	 * @returns {Number} Input power in W
	 * */
	input_power(){ throw Error("Should be overriden."); }
	/**
	 * Return system noise temperature at input (in K).
	 *
	 * @returns {Number} Noise temperature at input (in K).
	 * */
	noise_temperature_input(){ throw Error("Should be overriden."); }
	/**
	 * Return True if system is configured for TX.
	 *
	 * @returns {Boolean}
	 * */
	is_tx(){ throw Error("Should be overriden."); }
	/**
	 * Return True if system is configured for RX.
	 *
	 * @returns {Boolean}
	 * */
	is_rx(){ throw Error("Should be overriden."); }
	/**
	 * Return active CMAP.
	 *
	 * @returns {(v: Number) => String}
	 * */
	cmap(){ throw Error("Should be overriden."); }
	/**
	 * Auto-build global scene.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * @param {HTMLElement} container
	 * */
	static build(parent, container){
		const obj = new SceneSystemGlobals(parent);
		const tbl = document.createElement('table');
		const units = {};
		const vars = {};
		container.appendChild(tbl)

		const create_row = (id, inputType, unit) => {
			const tr = document.createElement('tr');
			tbl.appendChild(tr);
			if (inputType === undefined) inputType = 'input';
			const lbl = document.createElement('label');
			const inp = document.createElement(inputType);
			const cid = parent.prepend + "-" + id;
			inp.id = cid;
			lbl.setAttribute('for', cid);
			inp.setAttribute('name', cid);

			const td1 = document.createElement('td');
			const td2 = document.createElement('td');
			const td3 = document.createElement('td');

			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			if (unit !== undefined) {
				const sel = unit.build()
				td3.appendChild(sel);
				sel.setAttribute('name', cid + "-unit");
			}
			td1.appendChild(lbl);
			td2.appendChild(inp);
			return {
				'lbl': lbl,
				'inp': inp,
				'td3': td3,
				'td2': td2,
			}
		}
		const tunit = new ColumnUnitTemperature(obj, 'C');
		const tres = create_row('system-temperature', 'input', tunit);
		tres.inp.setAttribute('type', 'number');
		tres.inp.addEventListener('change', () => {parent.request_redraw();})
		tunit.addEventListener('change', () => {parent.request_redraw();})
		obj.system_temperature = () => { return tunit.convert_from(Number(tres.inp.value)); }
		tres.lbl.innerHTML = 'System Temperature';
		tres.inp.setAttribute('data-default', 16.85);
		units['t'] = tunit;
		vars['t'] = tres.inp;

		const funit = new ColumnUnitFrequency(obj, 'MHz');
		const fres = create_row('system-bandwidth', 'input', funit);
		fres.inp.setAttribute('type', 'number');
		fres.inp.setAttribute('data-default', 1);
		fres.inp.addEventListener('change', () => {parent.request_redraw();})
		funit.addEventListener('change', () => { parent.request_redraw(); })
		obj.bandwidth = () => { return funit.convert_from(Number(fres.inp.value)); }
		fres.lbl.innerHTML = 'Bandwidth';
		units['f'] = funit;
		vars['f'] = fres.inp;

		const punit = new ColumnUnitPower(obj, 'dBm');
		const pres = create_row('system-input-power', 'input', punit);
		pres.inp.setAttribute('type', 'number');
		pres.inp.setAttribute('data-default', -10);
		pres.inp.addEventListener('change', () => {parent.request_redraw();})
		punit.addEventListener('change', () => {parent.request_redraw();})
		obj.input_power = () => { return punit.convert_from(Number(pres.inp.value)); }
		pres.lbl.innerHTML = 'Input Signal Power';
		units['p'] = punit;
		vars['p'] = pres.inp;

		const nunit = new ColumnUnitTemperature(obj, 'K');
		const nres = create_row('system-noise-temperature', 'input', nunit);
		nres.inp.setAttribute('type', 'number');
		nres.inp.setAttribute('data-default', 290);
		nres.inp.addEventListener('change', () => {parent.request_redraw();})
		nunit.addEventListener('change', () => {parent.request_redraw();})
		obj.noise_temperature_input = () => { return nunit.convert_from(Number(nres.inp.value)); }
		nres.lbl.innerHTML = 'Input Noise Temperature';
		units['n'] = nunit;
		vars['n'] = nres.inp;

		const dres = create_row('system-direction', 'select');
		const opt1 = document.createElement('option');
		const opt2 = document.createElement('option');
		opt1.innerHTML = 'RX';
		opt2.innerHTML = 'TX';
		dres.inp.appendChild(opt1);
		dres.inp.appendChild(opt2);
		dres.inp.addEventListener('change', () => {parent.request_redraw();})
		obj.is_tx = () => { return opt2.selected; }
		obj.is_rx = () => { return opt1.selected; }
		dres.lbl.innerHTML = 'System Direction';
		vars['d'] = dres.inp;

		const cres = create_row('system-symbol-color', 'select');
		const cmap = parent.create_listed_colormap_selector('system-symbol-color', 'Vibrant')
		cres.inp.addEventListener('change', () => { parent.cmap = cmap.cmap(true); })
		cres.lbl.innerHTML = 'Symbol Color Scheme';
		cres.inp.setAttribute('data-default', cmap.defaultSelection);
		obj.cmap = () => { return cmap.cmap(true); }

		const but = document.createElement("button")
		but.innerText = "Reassign Colors";
		but.id = parent.prepend + "-reset-colors";
		cres.td2.setAttribute('colspan', 2);
		cres.td2.appendChild(but);
		cres.td3.remove();
		but.addEventListener('click', () => { parent.reset_colors(); });
		vars['c'] = cres.inp;

		const tr = document.createElement('tr');
		const td = document.createElement('td');
		const rb = document.createElement('button');
		tbl.appendChild(tr);
		tr.appendChild(td);
		td.appendChild(rb);
		td.setAttribute('colspan', 3);
		rb.innerText = "Reset Globals to Defaults";
		rb.title = "Reset globals to their default values (including color scheme). Does not reassign colors."
		rb.addEventListener('click', () => {obj.reset()});

		obj.vars = vars;
		obj.units = units;
		obj.reset();
		return obj;
	}
	reset(){
		for (const s of Object.values(this.vars)){
			const dv = s.getAttribute('data-default');
			if (dv === null || dv === undefined) continue
			s.value = dv;
		}
		for (const s of Object.values(this.units)) s.selected_unit = s.defaultUnit;
		this.parent.request_redraw();
	}
	save_parameters(){
		const res = {};
		for (const [k, s] of Object.entries(this.vars)){
			let v = s.value;
			if (v == s.getAttribute('data-default')) continue;
			if (s.getAttribute('type', 'Number')) v = Number(v);
			res[k] = v;
		}
		for (const [k, s] of Object.entries(this.units)){
			let v = s.selected_unit;
			if (v == s.defaultUnit) continue;
			res[k+"u"] = v;
		}
		return res;
	}
	load(config){
		try{
			for (const [k, s] of Object.entries(this.vars)){
				const v = config[k];
				if (v === undefined) continue;
				s.value = v;
			}
			for (const [k, s] of Object.entries(this.units)){
				const v = config[k + "u"];
				if (v === undefined) continue;
				s.selected_unit = v;
			}
			console.log("Globals loaded...");
		}
		catch (e){ parent.log_loading_error(e); }
	}
}
