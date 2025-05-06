import {SceneTheme, FindSceneURL} from "./scene/scene-util.js";
import {SceneParent} from "./scene/scene-abc.js"
import {SceneBannerError} from "./scene/scene-banners.js"
import {SceneSystemGlobals, SceneSystemPlot} from "./index-scenes.js"
import {SysColumns} from "./rfcascade/columns.js"
import {SysBlockAmplifier, SysBlockPassive, SysCalculationNode, SysBlocks, SysBlockNode, SysBlockCorporateCombiner, SysBlockAntenna, SysBlockCorporateDivider} from "./rfcascade/blocks.js"
import {save_system, load_system} from "./rfcascade/system-url.js"
import {find_colormap} from "./cmap/cmap-listed.js"
/**
 * @import { BlockHint } from "./rfcascade/blocks.js"
 * @import { SysColumnHint } from "./rfcascade/columns.js"
 */

export const engineering_formatter = new Intl.NumberFormat('en-US', {notation: 'engineering'})

document.addEventListener('DOMContentLoaded', () => {
	new SceneTheme();

	const scene = new SceneControlSystemCalc('sys');
});

/**
 * Create scene for System simulator.
 *
 * @param {string} prepend - Prepend used on HTML IDs.
 * */
export class SceneControlSystemCalc extends SceneParent{
	constructor(prepend){
		super(prepend, ['container', 'reset', 'add-type', 'add-type-selection', 'visibility-controls', 'globals']);
		this.updateWaiting = true;
		this.redrawRequested = true;
		this.globals = SceneSystemGlobals.build(this, this.find_element('globals'));
		this.cmap = find_colormap('Vibrant_r');

		const urlBanner = new SceneBannerError(this, null);
		urlBanner.text = "The URL created when saving the data exceeds 2000 characters. This will become a problem when sharing or saving. You could potentially reduce the size by removing part numbers or removing elements."
		urlBanner.hide();
		const url = FindSceneURL();
		url.add_url_warning(urlBanner);
		this.add_banner(urlBanner)

		const cont = this.find_element('container');
		const div = document.createElement('div');

		div.classList = "system-container";
		cont.appendChild(div);

		this.table = document.createElement('table');
		this.table.classList = 'system-table';
		div.appendChild(this.table);

		const _reset_columns = () => {
			this.columns = Array.from(this.calc_columns);
			this.columns.forEach((c) => { c.load_defaults(); })
		}

		this.find_element('reset').addEventListener('click', () => {
			this.blocks = this.create_default_blocks();
			_reset_columns();
			this.globals.reset();
			this.request_redraw();
		})
		this.find_element('reset-columns').addEventListener('click', () => {
			_reset_columns();
			this.request_redraw();
		})
		this.find_element('reset-colors').addEventListener('click', () => {
			for (let i = 0; i < this.blocks.length; i++){
				this.blocks[i].color = this.cmap(i);
			}
			this.request_redraw();
		})
		this.find_element('add-plot').addEventListener('click', () => {
			this.add_plot();
		})
		const sel = this.find_element('add-type-selection');
		SysBlocks.forEach((e) => {
			const opt = document.createElement('option');
			opt.innerHTML = e.title;
			sel.appendChild(opt);
		})
		this.find_element('add-type').addEventListener('click', () => {
			const v = sel.value;
			const c = this.cmap(this.blocks.length);
			SysBlocks.forEach((e) => {
				if (e.title == v) this.blocks.push(new e(this, {'color': c}));
			});
			this.request_redraw();
		})

		/** @type {Array<SysColumnHint>} */
		this.calc_columns = Array.from(SysColumns, (c) => new c(this));
		this.columns = Array.from(this.calc_columns);

		const vDiv = this.find_element('visibility-controls');
		const cDivs = {};
		this.calc_columns.forEach((c) => {
			if (!c.hideable) return;
			const s = c.section;
			let cDiv = cDivs[s.title];
			if (cDiv === undefined){
				cDiv = document.createElement('div');
				const pDiv = document.createElement('div');
				const h = document.createElement('h4');
				h.innerHTML = s.title;
				cDiv.classList = "visibility-selectors"
				cDivs[s.title] = cDiv;
				vDiv.appendChild(pDiv);
				pDiv.appendChild(h);
				pDiv.appendChild(cDiv);
			}
			c.addEventListener('visibility-changed', () => { this.request_redraw(); });
			c.create_visibility_selector(cDiv);
		})

		this.pcounter = 1;
		/** @type {Array<SceneSystemPlot>} */
		this.plots = []

		this.output = new SysBlockNode(this);
		load_system(this);
		this.request_redraw();
		this.start_draw_loop();
	}
	add_plot(defaults){
		const con = this.find_element("plots");
		const div = document.createElement('div');
		div.classList = "system-plot";
		con.appendChild(div);
		const p = new SceneSystemPlot(this, div, this.pcounter, defaults);
		this.plots.push(p);
		this.pcounter++;
	}
	create_default_blocks(){
		if (this.globals.is_rx()) return this.create_default_rx();
		return this.create_default_tx();
	}
	create_default_rx(){
		return [
			new SysBlockAntenna(this, {'color': this.cmap(0)}),
			new SysBlockPassive(this, {'gain': -2, 'color': this.cmap(1)}),
			new SysBlockAmplifier(this, {'color': this.cmap(2)}),
			new SysBlockCorporateCombiner(this, {'color': this.cmap(3)}),
			new SysBlockPassive(this, {'color': this.cmap(4)}),
		]
	}
	create_default_tx(){
		return [
			new SysBlockPassive(this, {'gain': -2, 'color': this.cmap(0)}),
			new SysBlockAmplifier(this, {'color': this.cmap(1)}),
			new SysBlockCorporateDivider(this, {'color': this.cmap(2)}),
			new SysBlockPassive(this, {'color': this.cmap(3)}),
			new SysBlockAntenna(this, {'color': this.cmap(4)}),
		]
	}
	request_redraw(){
		this.redrawRequested = true;
	}
	/**
	 * Move block in lineup
	 *
	 * @param {BlockHint} obj
	 * @param {1 | -1} direction
	 * */
	move_block(obj, direction){
		let ni = -1;
		let oi = -1;
		if (direction > 0) direction = 2;
		if (direction <= 0) direction = -1;
		for (let i = 0; i < this.blocks.length; i++){
			if (this.blocks[i] === obj){
				ni = i + direction;
				oi = i;
				break;
			}
		}
		if (ni >= 0 && ni <= this.blocks.length){
			const nb = [];
			for (let i = 0; i < this.blocks.length; i++){
				if (i == oi) continue;
				if (i == ni) nb.push(obj);
				nb.push(this.blocks[i]);
			}
			if (ni == this.blocks.length) nb.push(obj);
			this.blocks = nb;
			this.request_redraw();
		}
	}
	/**
	 * Move column.
	 *
	 * @param {SysColumnHint} col
	 * @param {1 | -1} direction
	 * */
	move_column(col, direction){
		let li = -1; // left column index
		let ri = -1; // right column index
		let oi = -1; // original index
		let mi = 0; // minimum index
		let ii = -1; // new index
		for (let i = 0; i < this.columns.length; i++){
			const icol = this.columns[i];
			if (icol.position_fixed) mi = i;
			else if (icol === col) oi = i;
			else if (!icol.hidden){
				if (oi < 0) li = i;
				ri = i;
				if (oi > 0) break;
			}
		}
		if (li < 0) li = mi;
		if (direction > 0) ii = ri + 1;
		if (direction <= 0) ii = li;

		if (ii > mi && ii <= this.columns.length){
			const nb = [];
			for (let i = 0; i < this.columns.length; i++){
				const icol = this.columns[i];
				if (icol.position_fixed){
					nb.push(icol);
					continue;
				}
				if (i == oi) continue;
				if (i == ii) nb.push(col);
				nb.push(icol);
			}
			if (nb.length != this.columns.length) nb.push(col);
			this.columns = nb;
			this.request_redraw();
		}
	}
	/**
	 * Add a row into the system calculator.
	 *
	 * @param {BlockHint} obj
	 * */
	add_row(obj, counter){
		obj['index'] = counter;
		const tr = document.createElement('tr');
		this.columns.forEach((r) => {
			const dtype = r.column_type;
			const td = document.createElement('td');
			obj.map_cell(r.parameter_key, td);
			td.classList = this.class_list(r);
			tr.appendChild(td);
			if (obj.is_node) return;
			if (dtype == 'attribute') td.innerHTML = obj.get_parameter(r.parameter_key);
			else if (dtype == 'move'){
				const but1 = document.createElement('button');
				const but2 = document.createElement('button');
				td.classList.add("td-side-button")
				but1.addEventListener('click', () => { this.move_block(obj, -1); });
				but1.classList = "button-side-up";
				but1.title = "Move item up."
				but2.addEventListener('click', () => { this.move_block(obj, 1); });
				but2.classList = "button-side-down";
				but2.title = "Move item down."
				td.appendChild(but1);
				td.appendChild(document.createElement('br'));
				td.appendChild(but2);
			}
			else if (dtype == 'remove'){
				const but1 = document.createElement('button');
				td.classList.add("td-side-button")
				but1.addEventListener('click', () => {
					const blks = Array.from(this.blocks);
					this.blocks = [];
					blks.forEach((b) => {
						if (b == obj) return;
						this.blocks.push(b);
					})
					this.request_redraw();
				});
				but1.classList = "button-side-remove";
				but1.title = "Remove block."
				td.appendChild(but1);
			}
			else if (dtype == 'icon'){
				const canvas = document.createElement('canvas');
				obj.icon_canvas = canvas;
				td.appendChild(canvas);
			}
			else if (dtype == 'input'){
				let inp;
				const itype = r.input_type;
				if (itype == 'number' || itype == 'text' || itype == 'color'){
					inp = document.createElement('input');
					inp.value = obj.get_parameter(r.parameter_key);
					inp.setAttribute('type', itype);
				}
				else if (Array.isArray(itype)){
					inp = document.createElement('select');
					itype.forEach((e) => {
						const opt = document.createElement('option');
						opt.innerHTML = e;
						inp.appendChild(opt);
					})
					inp.value = obj.get_parameter(r.parameter_key);
				}
				else throw Error(`Unknown input type ${itype}.`);
				td.appendChild(inp);
				inp.setAttribute('id', this.prepend + "-" + String(counter) + "-" + r.parameter_key)
				inp.addEventListener('change', () => {this.updateWaiting = true;});
				obj.map_input(r.parameter_key, inp);
			}
			else if (dtype == 'system-output'){
				// ignore because this is updated when calculation is complete.
			}
			else if (dtype == 'device-output'){
				// ignore because this is updated when calculation is complete.
			}
			else if (dtype == 'device-cascade'){
				// ignore because this is updated when calculation is complete.
			}
			else if (dtype == 'system-auto'){
				// ignore because this is updated when calculation is complete.
			}
			else if (dtype == 'system-cascade'){
				// ignore because this is updated when calculation is complete.
			}
			else throw Error(`Unknown column type ${dtype}.`);
		});
		this.table.appendChild(tr);
	}
	class_list(col){
		let kls = "td-" + col.column_type + " td-" + col.parameter_key;
		if (col.hidden) kls += " td-hidden";
		return kls;
	}
	add_headers(){
		const tr1 = document.createElement('tr');
		const tr2 = document.createElement('tr');
		const tr3 = document.createElement('tr');
		this.table.appendChild(tr3);
		this.table.appendChild(tr1);
		this.table.appendChild(tr2);
		this.columns.forEach((r) => {
			const td1 = document.createElement('th');
			const td2 = document.createElement('td');
			const td3 = document.createElement('td');
			const cl = this.class_list(r);
			r.create_unit(td2);
			r.bind_header(td1);
			tr3.appendChild(td3);
			tr1.appendChild(td1);
			tr2.appendChild(td2);
			td1.classList = cl;
			td3.classList = cl + ' td-header-button';
			td2.classList = cl + ' unit-header';

			if (!r.position_fixed){
				const but1 = document.createElement('button');
				but1.addEventListener('click', () => {
					this.move_column(r, -1);
				})
				but1.classList = "button-header-left button-header";
				but1.title = "Move column left."
				td3.appendChild(but1);
			}
			if (r.hideable){
				const but3 = document.createElement('button');

				but3.addEventListener('click', () => {
					r.visible = false;
				})
				but3.classList = "button-header-hide button-header";
				but3.title = "Hide column from view."
				td3.appendChild(but3);
			}
			if (!r.position_fixed){
				const but2 = document.createElement('button');
				but2.addEventListener('click', () => {
					this.move_column(r, 1);
				})
				but2.classList = "button-header-right button-header";
				but2.title = "Move column right."
				td3.appendChild(but2);
			}
		});
	}
	add_footer(){
		const tr1 = document.createElement('tr');
		this.table.appendChild(tr1);
		this.columns.forEach((r) => {
			const td1 = document.createElement('td');
			tr1.appendChild(td1);
			const cl = this.class_list(r);
			td1.classList = cl;
		});
	}
	start_draw_loop(){
		if (this.running === true) return;
		this.running = true;
		const _draw = () => {
			let replot = false;
			if (this.redrawRequested){

				this.table.innerHTML = '';
				this.calc_columns.forEach((c) => {c.check(this.blocks);})
				this.add_headers();
				let counter = 1;
				this.blocks.forEach((b) => {
					this.add_row(b, counter);
					counter++;
				});
				this.add_row(this.output, counter);
				this.updateWaiting = true;
				this.redrawRequested = false;
			}
			if (this.updateWaiting){
				const blocks = Array.from(this.blocks);
				blocks.push(this.output);

				blocks.forEach((b) => {
					b.process_inputs();
					b.reset_parameters();
					b.process_drawings();
				});

				const node = new SysCalculationNode(this);

				blocks.forEach((b) => {
					if (!b.enabled) return;
					const _calc_group = (key) => {
						this.calc_columns.forEach((c) => {
							if (c.column_type == key && (c.visible || c.required)) c.calculate_element(node, b);
						});
					}
					_calc_group('device-output');
					_calc_group('system-output');
					_calc_group('system-cascade');
					_calc_group('system-auto');
					_calc_group('device-cascade');
				});
				this.updateWaiting = false;
				replot = true;
			}
			this.columns.forEach((c) => {
				if (c.reformatWaiting){
					this.blocks.forEach((b) => {
						c.reformat(b);
					});
					c.reformat(this.output);
					replot = true;
				}
			});
			if (this.process_plots(replot)) save_system(this);
			requestAnimationFrame(_draw);
		}
		_draw();
	}
	redraw_plots(){
		const plts = Array.from(this.plots);

		this.find_element("plots").innerHTML = '';
		this.plots = [];
		plts.forEach((p) => {
			if (p.needsDelete) return;
			this.add_plot(p.save_parameters);
		})
	}
	process_plots(force){
		let redraw = false;
		let save = force;
		this.plots.forEach((p) => {
			if (p.needsDelete){
				redraw = true;
				save = true;
			}
		});
		if (redraw) this.redraw_plots();
		this.plots.forEach((p) => {
			if (p.needsSave || force) save = true;
			if (!p.needsUpdate && !force) return
			p.draw();
		})
		return save;
	}
	/**
	 * Format input Number to a string.
	 *
	 * @param {Number} value
	 * @param {Boolean} [allowEng=true] Allow engineering format?
	 * @returns {String}
	 * */
	format_float(value, allowEng){
		if (value == Infinity) return "Inf";
		if (value == -Infinity) return "-Inf";
		const av = Math.abs(value);
		if (av > 1e-2 && av < 1e3 || av == 0.0 || !allowEng) return `${value.toFixed(2)}`;
		return engineering_formatter.format(value);
	}
}
