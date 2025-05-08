import {SceneTheme, FindSceneURL} from "./scene/scene-util.js";
import {SceneParent} from "./scene/scene-abc.js"
import {SceneBannerError} from "./scene/scene-banners.js"
import {SceneSystemGlobals} from "./rfcascade/scene-globals.js"
import {ScenePlotManager} from "./rfcascade/scene-plot-manager.js"
import {SceneColumnSelectors} from "./rfcascade/scene-column-selectors.js"
import {SysColumns} from "./rfcascade/columns.js"
import {SysBlockActive, SysBlockPassive, SysCalculationNode, SysBlocks, SysBlockNode, SysBlockCorporateCombiner, SysBlockAntenna, SysBlockCorporateDivider} from "./rfcascade/blocks.js"
import {save_system_url, save_system_config, load_system_url, load_system_config, log_loading_error} from "./rfcascade/system-url.js"
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
		super(prepend, ['container', 'add-type', 'add-type-selection', 'visibility-controls', 'globals', 'save', 'load', 'clear']);
		this.updateWaiting = true;
		this.redrawRequested = true;
		this.globals = SceneSystemGlobals.build(this, this.find_element('globals'));

		const urlBanner = new SceneBannerError(this, null);
		urlBanner.text = (
			"The URL created when saving the data exceeds 2000 characters. "
			+ "This will become a problem in some browsers when sharing or saving.<br>"
			+ "You could potentially reduce the size by removing part numbers, resetting globals, removing elements, or removing plots."
		);
		urlBanner.hide();
		const url = FindSceneURL();
		url.add_url_warning(urlBanner);
		this.add_banner(urlBanner)

		const cont = this.find_element('container');
		const div = document.createElement('div');

		cont.appendChild(div);

		this.table = document.createElement('table');
		this.table.classList = 'system-table';
		div.appendChild(this.table);
		this.plotManager = new ScenePlotManager(this);
		const sel = this.find_element('add-type-selection');
		SysBlocks.forEach((e) => {
			const opt = document.createElement('option');
			opt.innerHTML = e.title;
			sel.appendChild(opt);
		})
		this.find_element('add-type').addEventListener('click', () => {
			const v = sel.value;
			const c = this.globals.cmap()(this.blocks.length);
			SysBlocks.forEach((e) => {
				if (e.title == v) this.blocks.push(new e(this, {'color': c}));
			});
			this.request_redraw();
		})

		/** @type {Array<SysColumnHint>} */
		this.calc_columns = Array.from(SysColumns, (c) => new c(this));
		this.columns = Array.from(this.calc_columns);
		const csel = new SceneColumnSelectors(this, this.find_element('visibility-controls'), this.calc_columns);
		csel.addEventListener('reset-column-order', () => {this.reset_column_order();})

		this.find_element('clear').addEventListener('click', () => {
			this.blocks = this.create_default_blocks();
			this.request_redraw();
		});

		this.find_element('save').addEventListener('click', () => {
			try{
				const config = save_system_config(this);
				navigator.clipboard.writeText(JSON.stringify(config));
				this.throw_notice("System configuration saved to clipboard.");
			}
			catch(e){
				this.throw_error("Failed to copy to clipboard.");
			}
		})
		this.find_element('load').addEventListener('click', () => {
			const str = prompt("Please paste config below.");
			if (str === null) return;
			try{
				const config = JSON.parse(str);
				if (load_system_config(this, config)) this.throw_notice("System sucessfully loaded");
				else this.throw_error("There was an issue when loading system. Try again.");
			}
			catch(e){
				this.log_loading_error(e);
				this.throw_error("There was an issue when parsing input. Try again.");
			}
		})

		this.output = new SysBlockNode(this);
		load_system_url(this);
		this.request_redraw();
		this.start_draw_loop();
	}
	request_redraw(){ this.redrawRequested = true; }
	reset_colors(){
		const cmap = this.globals.cmap();
		for (let i = 0; i < this.blocks.length; i++) this.blocks[i].color = cmap(i);
		this.request_redraw();
	}
	reset_column_order(){
		this.columns = Array.from(this.calc_columns);
		this.request_redraw();
	}
	create_default_blocks(){
		if (this.globals.is_rx()) return this.create_default_rx();
		return this.create_default_tx();
	}
	create_default_rx(){
		const cmap = this.globals.cmap();
		return [
			new SysBlockAntenna(this, {'color': cmap(0)}),
			new SysBlockPassive(this, {'gain': -2, 'color': cmap(1)}),
			new SysBlockActive(this, {'color': cmap(2)}),
			new SysBlockCorporateCombiner(this, {'color': cmap(3)}),
			new SysBlockPassive(this, {'color': cmap(4)}),
		]
	}
	create_default_tx(){
		const cmap = this.globals.cmap();
		return [
			new SysBlockPassive(this, {'gain': -2, 'color': cmap(0)}),
			new SysBlockActive(this, {'color': cmap(1)}),
			new SysBlockCorporateDivider(this, {'color': cmap(2)}),
			new SysBlockPassive(this, {'color': cmap(3)}),
			new SysBlockAntenna(this, {'color': cmap(4)}),
		]
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
			if (this.plotManager.process(replot)) save_system_url(this);
			requestAnimationFrame(_draw);
		}
		_draw();
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
	save_columns(){
		const vCols = [];
		for (let i = 0; i < this.columns.length; i++){
			const c = this.columns[i];
			const e = [c.constructor.uindex, c.visible ? 1 : 0];
			if (c.selected_unit !== null && c.selected_unit != c.unit_default && c.unit_default !== null){
				e.push(c.selected_unit);
			}
			vCols.push(e);
		}
		return vCols;
	}
	/**
	 * Load columns from input.
	 *
	 * @param {Array<Array<Any>>} config
	 * */
	load_columns(config){
		const ncols = [];
		const scols = {};
		const ocols = {}; // fixed columns.
		this.calc_columns.forEach((c) => {
			if (c.position_fixed) {
				ncols.push(c);
				ocols[c.constructor.uindex] = c;
			}
			else scols[c.constructor.uindex] = c;
		});

		try{
			for (let i = 0; i < config.length; i++){
				let k, v, entry;
				try{
					entry = config[i];
					k = entry[0];
					v = Boolean(entry[1]);
				}
				catch(e){
					log_loading_error(e);
					continue;
				}
				/** @type {SysColumnHint} */
				let c;
				if (scols.hasOwnProperty(k)){
					c = scols[k];
					ncols.push(c);
					delete scols[k];
				}
				else if (ocols.hasOwnProperty(k)){
					c = ocols[k];
					delete ocols[k];
				}
				c.visible = Boolean(v);
				if (entry.length >= 3) c.selected_unit = entry[2];
			}
		}
		catch(e){
			log_loading_error(e);
			return;
		}
		console.log(`${ncols.length} columns(s) loaded...`)
		if (this.calc_columns.length != ncols.length) console.log(`${this.calc_columns.length - ncols.length} columns(s) added...`)
		this.calc_columns.forEach((c) => { if (!ncols.includes(c)) ncols.push(c); })
		this.columns = ncols;
	}
	log_loading_error(...a){ log_loading_error(...a); }
}
