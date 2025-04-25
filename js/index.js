import {SceneTheme, FindSceneURL} from "./scene/scene-util.js";
import {SceneParent} from "./scene/scene-abc.js"
import {SceneSystemGlobals} from "./index-scenes.js"
import {SysColumns} from "./rfcascade/columns.js"
import {SysBlockAmplifier, SysBlockPassive, SysCalculationNode, SysBlocks} from "./rfcascade/blocks.js"
import {save_blocks, load_blocks} from "./rfcascade/blocks-url.js"
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
		super(prepend, ['container', 'reset', 'add-type', 'add-type-selection']);
		this.updateWaiting = true;
		this.globals = SceneSystemGlobals.build(this);

		const cont = this.find_element('container');
		const div = document.createElement('div');

		div.classList = "system-container";
		cont.appendChild(div);

		this.table = document.createElement('table');
		this.table.classList = 'system-table';
		div.appendChild(this.table);

		this.find_element('reset').addEventListener('click', () => {
			this.blocks = this.create_default_blocks();
			this.redraw_scene();
		})
		const sel = this.find_element('add-type-selection');
		this.find_element('add-type').addEventListener('click', () => {
			const v = sel.value;
			SysBlocks.forEach((e) => {
				if (e.title == v) this.blocks.push(new e(this));
			});
			this.redraw_scene();
		})
		SysBlocks.forEach((e) => {
			const opt = document.createElement('option');
			opt.innerHTML = e.title;
			sel.appendChild(opt);
		})

		/** @type {Array<SysColumnHint>} */
		this.columns = Array.from(SysColumns, (c) => new c(this));

		const url = FindSceneURL();
		let blocks = load_blocks(this, url.get_param('blocks'));
		if (blocks !== null && blocks.length != 0) this.blocks = blocks;
		else this.blocks = this.create_default_blocks();
		this.redraw_scene();
	}
	create_default_blocks(){
		return [
			new SysBlockPassive(this, {'gain': -2}),
			new SysBlockAmplifier(this),
			new SysBlockPassive(this),
		]
	}
	redraw_scene(){
		this.table.innerHTML = '';
		this.add_headers();
		let counter = 1;
		this.blocks.forEach((b) => {
			b['index'] = counter;
			this.add_row(b);
			counter++;
		});
		this.updateWaiting = true;
		this.calculate();
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
			this.redraw_scene();
		}
	}
	/**
	 * Add a row into the system calculator.
	 *
	 * @param {BlockHint} obj
	 * */
	add_row(obj){
		const tr = document.createElement('tr');
		this.columns.forEach((r) => {
			const dtype = r.column_type;
			if (!r.visible) return;
			const td = document.createElement('td');
			obj.map_cell(r.parameter_key, td);
			td.classList = this.class_list(r);
			if (dtype == 'attribute') td.innerHTML = obj.get_parameter(r.parameter_key);
			else if (dtype == 'up'){
				const but = document.createElement('button');
				but.innerHTML = "Move Up";
				but.addEventListener('click', () => { this.move_block(obj, -1); });
				td.appendChild(but);
			}
			else if (dtype == 'down'){
				const but = document.createElement('button');
				but.innerHTML = "Move Down";
				but.addEventListener('click', () => { this.move_block(obj, 1); });
				td.appendChild(but);
			}
			else if (dtype == 'input'){
				let inp;
				const itype = r.input_type;
				if (itype == 'number' || itype == 'text'){
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
				inp.addEventListener('change', () => {this.updateWaiting = true;});
				obj.map_input(r.parameter_key, inp);
			}
			else if (dtype == 'system-output'){
				// ignore because this is updated when calculation is complete.
			}
			else if (dtype == 'device-output'){
				// ignore because this is updated when calculation is complete.
			}
			else if (dtype == 'system-auto'){
				// ignore because this is updated when calculation is complete.
			}
			else throw Error(`Unknown column type ${dtype}.`);
			tr.appendChild(td);
		});
		this.table.appendChild(tr);
	}
	class_list(col){
		return "td-" + col.column_type + " td-" + col.parameter_key;
	}
	add_headers(){
		const tr1 = document.createElement('tr');
		const tr2 = document.createElement('tr');
		this.table.appendChild(tr1);
		this.table.appendChild(tr2);
		this.columns.forEach((r) => {
			if (!r.visible) return;
			const td1 = document.createElement('th');
			const td2 = document.createElement('td');
			const cl = this.class_list(r);
			r.create_unit(td2);
			r.bind_header(td1);
			tr1.appendChild(td1);
			tr2.appendChild(td2);
			td1.classList = cl;
			td2.classList = cl + ' unit-header';
		});
	}
	calculate(){
		if (this.running === true) return;
		this.running = true;
		const _calculate = () => {
			if (this.updateWaiting){
				const url = FindSceneURL();

				this.blocks.forEach((b) => {
					b.process_inputs();
					b.reset_parameters();
				});
				url.set_param('blocks', save_blocks(this.blocks));
				console.log(location.href);
				console.log(location.href.length);

				const node = new SysCalculationNode(this);
				this.blocks.forEach((b) => {
					if (!b.enabled) return;
					this.columns.forEach((c) => {
						if (c.column_type == 'device-output' && (c.visible || c.required)){
							c.calculate_element(node, b);
						}
					});
					this.columns.forEach((c) => {
						if (c.column_type == 'system-output' && (c.visible || c.required)) c.calculate_element(node, b);
					});
					this.columns.forEach((c) => {
						if (c.column_type == 'system-auto' && (c.visible || c.required)) c.calculate_element(node, b);
					});
				});
				this.updateWaiting = false;
			}
			this.columns.forEach((c) => {
				if (c.reformatWaiting){
					this.blocks.forEach((b) => {
						c.reformat(b);
					})
				}
			});
			requestAnimationFrame(_calculate);
		}
		_calculate();
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
