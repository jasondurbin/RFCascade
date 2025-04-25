import {SceneTheme} from "./scene/scene-util.js";
import {SceneParent} from "./scene/scene-abc.js"
import {SceneSystemGlobals} from "./index-scenes.js"
import {SysColumns} from "./rfcascade/columns.js"
import {SysBlockAmplifier, SysBlockPassive, SysCalculationNode} from "./rfcascade/blocks.js"
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
		super(prepend, ['container']);
		this.updateWaiting = true;
		this.globals = SceneSystemGlobals.build(this);

		const cont = this.find_element('container');
		const div = document.createElement('div');

		div.classList = "system-container";
		cont.appendChild(div);

		this.table = document.createElement('table');
		this.table.classList = 'system-table';
		div.appendChild(this.table);

		/** @type {Array<SysColumnHint>} */
		this.columns = Array.from(SysColumns, (c) => new c(this));
		this.blocks = [
			new SysBlockPassive(this, {'gain': -2}),
			new SysBlockAmplifier(this),
			new SysBlockPassive(this),
		]
		this.add_headers();

		this.blocks.forEach((e) => {this.add_row(e)});

		this.calculate();
	}
	/**
	 * Add a row into the system calculator.
	 *
	 * @param {BlockHint} [obj]
	 * */
	add_row(obj){
		const tr = document.createElement('tr');
		this.columns.forEach((r) => {
			const dtype = r.column_type;
			if (!r.visible) return;
			const td = document.createElement('td');
			obj.map_cell(r.parameter_key, td);
			if (dtype == 'attribute') td.innerHTML = obj.get_parameter(r.parameter_key);
			else if (dtype == 'input'){
				const inp = document.createElement('input');
				inp.value = obj.get_parameter(r.parameter_key);
				inp.setAttribute('type', r.input_type);
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
	add_headers(){
		const tr1 = document.createElement('tr');
		const tr2 = document.createElement('tr');
		this.table.appendChild(tr1);
		this.table.appendChild(tr2);
		this.columns.forEach((r) => {
			if (!r.visible) return;
			const td1 = document.createElement('th');
			const td2 = document.createElement('td');
			r.create_unit(td2);
			td1.innerHTML = r.title;
			tr1.appendChild(td1);
			tr2.appendChild(td2);
			td2.classList = 'unit-header';
		});
	}
	calculate(){
		const _calculate = () => {
			if (this.updateWaiting){
				this.blocks.forEach((b) => {
					b.process_inputs();
					b.reset_parameters();
				});

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
		const av = Math.abs(value);
		if (av > 1e-2 && av < 1e3 || !allowEng) return `${value.toFixed(2)}`;
		return engineering_formatter.format(value);
	}
}
