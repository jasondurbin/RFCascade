import {SceneControl} from "./scene/scene-abc.js";
import {ScenePlot1D} from "./scene/plot-1d/scene-plot-1d.js";
import {linspace} from "./util.js";
import {ColumnUnitTemperature, ColumnUnitFrequency, ColumnUnitPower} from "./rfcascade/column-units.js";
/**
 * @import { SceneControlSystemCalc } from "./index.js"
 * @import { SysColumnHint } from "./rfcascade/columns.js"
 * */

export const c_boltzmann =  1.380649*(10**-23);
/**
 * Create global scene for System simulator.
 *
 * @param {SceneControlSystemCalc} parent
 * */
export class SceneSystemGlobals extends SceneControl{
	constructor(parent){
		super(parent, ["reset-globals"]);
		this.__resets = [];
		this.find_element("reset-globals").addEventListener('click', () => {this.reset()});
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
		const tunit = new ColumnUnitTemperature(this, 'C');
		const tres = create_row('system-temperature', 'input', tunit);
		tres.inp.setAttribute('type', 'number');
		tres.inp.value = 16.85;
		tres.inp.addEventListener('change', () => {parent.request_redraw();})
		tunit.addEventListener('change', () => {parent.request_redraw();})
		obj.system_temperature = () => { return tunit.convert_from(Number(tres.inp.value)); }
		tres.lbl.innerHTML = 'System Temperature';
		obj.__resets.push(() => {
			tunit.selected_unit = 'C';
			tres.inp.value = 16.85;
		})
		units['t'] = tunit;
		vars['t'] = tres.inp;

		const funit = new ColumnUnitFrequency(this, 'MHz');
		const fres = create_row('system-bandwidth', 'input', funit);
		fres.inp.setAttribute('type', 'number');
		fres.inp.value = 1;
		fres.inp.addEventListener('change', () => {parent.request_redraw();})
		funit.addEventListener('change', () => { parent.request_redraw(); })
		obj.bandwidth = () => { return funit.convert_from(Number(fres.inp.value)); }
		fres.lbl.innerHTML = 'Bandwidth';
		obj.__resets.push(() => {
			funit.selected_unit = 'MHz';
			fres.inp.value = 1.0;
		})
		units['f'] = funit;
		vars['f'] = fres.inp;

		const punit = new ColumnUnitPower(this, 'dBm');
		const pres = create_row('system-input-power', 'input', punit);
		pres.inp.setAttribute('type', 'number');
		pres.inp.value = -10;
		pres.inp.addEventListener('change', () => {parent.request_redraw();})
		punit.addEventListener('change', () => {parent.request_redraw();})
		obj.input_power = () => { return punit.convert_from(Number(pres.inp.value)); }
		pres.lbl.innerHTML = 'Input Power';
		obj.__resets.push(() => {
			punit.selected_unit = 'dBm';
			pres.inp.value = -10;
		})
		units['p'] = punit;
		vars['p'] = pres.inp;

		const nunit = new ColumnUnitTemperature(this, 'K');
		const nres = create_row('system-noise-temperature', 'input', nunit);
		nres.inp.setAttribute('type', 'number');
		nres.inp.value = 290;
		nres.inp.addEventListener('change', () => {parent.request_redraw();})
		nunit.addEventListener('change', () => {parent.request_redraw();})
		obj.noise_temperature_input = () => { return nunit.convert_from(Number(nres.inp.value)); }
		nres.lbl.innerHTML = 'Input Noise Temperature';
		obj.__resets.push(() => {
			nunit.selected_unit = 'K';
			nres.inp.value = 290;
		})
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
		obj.__resets.push(() => {
			opt1.selected = true;
		})
		vars['d'] = dres.inp;

		const cres = create_row('system-symbol-color', 'select');
		const cmap = parent.create_listed_colormap_selector('system-symbol-color', 'Vibrant')
		cres.inp.addEventListener('change', () => { parent.cmap = cmap.cmap(true); })
		cres.lbl.innerHTML = 'Symbol Color Scheme';
		obj.__resets.push(() => {
			cres.inp.value = "Vibrant";
		})
		obj.cmap = () => { return cmap.cmap(true); }

		const but = document.createElement("button")
		but.innerText = "Reset Colors";
		but.id = parent.prepend + "-reset-colors";
		cres.td2.setAttribute('colspan', 2);
		cres.td2.appendChild(but);
		cres.td3.remove();
		vars['c'] = cres.inp;

		obj.load = (config) => {
			try{
				for (const [k, s] of Object.entries(vars)){
					const v = config[k];
					if (v === undefined) continue;
					s.value = v;
				}
				for (const [k, s] of Object.entries(units)){
					const v = config[k + "u"];
					if (v === undefined) continue;
					s.selected_unit = v;
				}
			}
			catch (e){
				console.log(e);
			}
		}
		obj.save_parameters = () => {
			const res = {};
			for (const [k, s] of Object.entries(vars)){
				let v = s.value;
				if (s.getAttribute('type', 'Number')) v = Number(v);
				res[k] = v;
			}
			for (const [k, v] of Object.entries(units)){
				res[k+"u"] = v.selected_unit;
			}
			return res;
		}
		return obj;
	}
	reset(){
		this.__resets.forEach(c => c());
		this.parent.request_redraw();
	}
	save_parameters(){
		return {};
	}
}

const ICO_SIZE = 50;
export class SceneSystemPlot extends ScenePlot1D{
	/**
	 * Create global scene for System simulator.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * @param {HTMLDivElement} element
	 * @param {Number} counter
	 * */
	constructor(parent, element, counter, loadPars){
		const pre = "plot-" + String(counter);
		const chc = document.createElement('select');
		const lbl1 = document.createElement('label');
		const div1 = document.createElement('div');
		const div2 = document.createElement('div')
		const div3 = document.createElement('div');
		const but1 = document.createElement('button');
		const axis = {};

		parent.columns.forEach((c) => {
			if (!c.plottable) return;
			const opt = document.createElement('option');
			opt.innerHTML = c.title;
			chc.appendChild(opt);
			opt.setAttribute('data-cls', c.constructor.name);
			opt.setAttribute('data-uindex', c.constructor.uindex);
		})
		const _create_colormap = (pre) => {
			const div = document.createElement('div');
			const lbl = document.createElement('label');
			const sel = document.createElement('select');
			const cmk = pre + "-colormap"

			lbl.setAttribute('for', cmk);
			sel.id = cmk;
			sel.setAttribute('name', cmk);
			sel.addEventListener('change', () => {
				this.needsSave = true;
			});
			lbl.innerText = "Colormap";
			div.appendChild(lbl);
			div.appendChild(document.createElement("br"));
			div.appendChild(sel);
			return div;
		}
		const _create_scale_controls = (pre) => {
			const div = document.createElement('div');
			const chk1 = document.createElement("input");
			const lbl1 = document.createElement("label");
			const mina = document.createElement("input");
			const lbl2 = document.createElement("label");
			const maxa = document.createElement("input");
			const lbl3 = document.createElement("label");
			const step = document.createElement("input");
			const lbl4 = document.createElement("label");
			const chk2 = document.createElement("input");
			const lbl5 = document.createElement("label");
			/**
			 * @param {HTMLInputElement} inp
			 * @param {HTMLLabelElement} lbl
			 * @param {String} title
			 * @param {String} itype
			 * */
			const _lbl = (inp, lbl, title, itype) => {
				const div2 = document.createElement('div');
				if (itype === undefined) itype = 'number';
				const nkey = pre + "-" + title.replace(" ", "-").toLowerCase();
				inp.setAttribute('type', itype);
				inp.setAttribute('name', nkey);
				inp.id = nkey;
				lbl.innerText = title;
				lbl.setAttribute('for', nkey);
				lbl.style = "user-select: none; cursor: pointer;";
				if (itype == 'checkbox'){
					div2.appendChild(inp);
					div2.appendChild(lbl);
				}
				else{
					div2.appendChild(lbl);
					div2.appendChild(document.createElement("br"));
					div2.appendChild(inp);
				}
				div.appendChild(div2);
				return div2;
			}
			_lbl(mina, lbl2, 'Min Y');
			_lbl(maxa, lbl3, 'Max Y');
			let ldiv = _lbl(chk1, lbl1, 'Auto Scale', 'checkbox');
			ldiv.style = "white-space: nowrap; margin: auto 0;"
			_lbl(step, lbl4, 'Y Steps');
			ldiv = _lbl(chk2, lbl5, 'Auto Steps', 'checkbox');
			ldiv.style = "white-space: nowrap; margin: auto 0;"
			axis['auto_scale'] = chk1;
			axis['min'] = mina;
			axis['max'] = maxa;
			axis['steps'] = step;
			axis['auto_steps'] = chk2;
			chk1.checked = true;
			chk2.checked = true;
			div.classList = "system-plot-y-axis-controls";
			return div;
		}

		chc.addEventListener('change', () => {
			this.needsSave = true;
			this.needsUpdate = true;
		});
		but1.addEventListener('click', () => {
			this.needsDelete = true;
		})
		but1.innerHTML = 'Remove';
		but1.classList = "plot-button-remove"

		chc.id = parent.prepend + "-" + pre + "-choice";
		lbl1.setAttribute('for', chc.id);
		lbl1.innerText = "Parameter to Plot"
		div1.classList = "canvas-header";

		div1.appendChild(lbl1);
		div1.appendChild(chc);
		div1.appendChild(but1);

		element.appendChild(div1);
		element.appendChild(div2);
		element.appendChild(div3);

		const prefix = parent.prepend + "-" + pre;
		div2.classList = "canvas-wrapper";
		const canvas = document.createElement("canvas");
		canvas.id = prefix;
		div2.appendChild(canvas);

		div3.appendChild(_create_colormap(prefix));
		div3.appendChild(_create_scale_controls(prefix));
		div3.classList = "canvas-footer";

		super(parent, canvas, pre + "-colormap");
		this.install_axis_controls('y', axis);
		this.needsDelete = false;
		this.needsUpdate = true;
		this.needsSave = true;

		this.selector = chc;
		if (loadPars !== undefined){
			const cm = loadPars[1];
			const cms = this.cmap.selector;
			for (let i = 0; i < cms.length; i++){
				if (cms[i].innerHTML == cm) cms[i].setAttribute('selected', true);
			}
			const skey = loadPars[0];
			for (let i = 0; i < chc.length; i++){
				if (chc[i].getAttribute('data-uindex') == skey) chc[i].setAttribute('selected', true);
			}
			this.load_axis_config('y', loadPars[2]);
		}
		this.addEventListener("axis-controls-change", () => {this.needsSave = true; })
		window.addEventListener('resize', (e) => {
			const m = this.get_magnification();
			if (m != this.magnification) this.redrawWaiting = true;
		});
	}
	get save_parameters(){
		this.needsSave = false;
		return [
			this.active_column().constructor.uindex,
			this.selected_cmap(),
			this.save_axis_config('y')
		]
	}
	/**
	 * Find and return selected column
	 *
	 * @returns {SysColumnHint}
	 * */
	active_column(){
		const cols = this.parent.columns;
		let sel = this.selector[0].getAttribute('data-cls');
		for (let i = 0; i < this.selector.length; i++){
			const opt = this.selector[i];
			if (!opt.selected) continue;
			sel = opt.getAttribute('data-cls');
		}
		for (let i = 0; i < cols.length; i++){
			const kls = cols[i];
			if (kls.constructor.name != sel) continue;
			return kls;
		}
		return cols[0];
	}
	get_magnification(){
		if (this.canvas.clientWidth > 800) return 1;
		return Math.max(1, Math.min(2, 800/this.canvas.clientWidth));
	}
	draw(){
		const col = this.active_column();
		const x = [];
		const y = [];

		let xc = 0;

		let minY = Infinity;
		let maxY = -Infinity;
		this.parent.blocks.forEach((b) => {
			const yi = col.value(b);
			x.push(xc);
			y.push(yi);
			xc++;

			if (isFinite(yi) && !isNaN(yi)){
				minY = Math.min(minY, yi);
				maxY = Math.max(maxY, yi);
			}
		})

		if (maxY == minY){
			maxY -= 1;
			minY += 1;
		}

		this.reset();
		this.magnification = this.get_magnification();
		this.set_xgrid(x[0], xc-1, xc);
		this.config_auto_y(minY, maxY, 11);
		this.add_data(x, y, null, {'markers': true});
		this.set_ylabel(col.label);
		this.needsUpdate = false;

		super.draw();
	}
	draw_xgrid(){
		let sect;
		const ctx = this.create_context();
		const count = this.xGrid.length;
		const maxY = this._ycBounds[1];
		const textPadding = this.cTextPadding;
		const minY = this._ycBounds[0];
		const blocks = this.parent.blocks;

		if (count == 1) sect = [(this._xcBounds[0] + this._xcBounds[1])/2];
		else sect = linspace(this._xcBounds[0], this._xcBounds[1], count);

		ctx.save();
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';

		ctx.beginPath();
		for (let i = 0; i < count; i++){
			if (i > 0 && i < count - 1){
				ctx.moveTo(parseInt(sect[i]), minY);
				ctx.lineTo(parseInt(sect[i]), maxY);
			}
		}
		ctx.stroke();
		ctx.restore();

		for (let i = 0; i < count; i++){
			ctx.save();
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'left';
			ctx.translate(sect[i], minY+textPadding+ICO_SIZE);
			ctx.rotate(45*Math.PI/180);
			//ctx.fillStyle = blocks[i].get_parameter('color');
			ctx.fillText(blocks[i].get_parameter('part_number'), 0, 0);
			ctx.restore();

			ctx.save();
			ctx.translate(sect[i], minY+textPadding);
			ctx.scale(ICO_SIZE, ICO_SIZE);
			ctx.translate(-0.5, 0);
			ctx.lineWidth = 1/25;
			blocks[i].draw_icon(ctx);
			ctx.restore();
		}
	}
	compute_grid_bounds(){
		super.compute_grid_bounds();
		const blocks = this.parent.blocks;
		const textPadding = this.cTextPadding;
		const ctx = this.create_context();
		let mx = 0.0
		blocks.forEach((b) => {
			const txt = b.get_parameter('part_number');
			let mt = ctx.measureText(txt);
			mx = Math.max(mt.width, mx);
		});

		const txt = blocks[blocks.length - 1].get_parameter('part_number');
		let mt = ctx.measureText(txt);
		this._ycBounds[0] = this.canvas.height - this.cPadding - textPadding - mx*Math.sin(Math.PI*45/180)-ICO_SIZE;
		this._xcBounds[1] -= Math.max(ICO_SIZE/2, mt.width*Math.cos(Math.PI*45/180));
	}
}
