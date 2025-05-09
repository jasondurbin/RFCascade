import {SceneControl} from "../scene/scene-abc.js";
/**
 * @import { SceneControlSystemCalc } from "../index.js"
 * @import { SysColumnHint } from "./columns.js"
 * */

export class SceneColumnSelectors extends SceneControl{
	static autoUpdateURL = false;
	/**
	 * Create column selectors for System Calculator.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * @param {HTMLElement} container
	 * @param {Array<SysColumnHint>} columns
	 * */
	constructor(parent, container, columns){
		super(parent, []);
		this.__resetCallers = [];
		this.add_event_types('reset-column-order');
		const cDivs = {};
		const _vis = (v, stitle) => {
			for (let i = 0; i < columns.length; i++){
				const c = columns[i];
				if (!c.hideable) continue;
				if (stitle !== undefined && c.section.title != stitle) continue;
				c.visible = v;
			}
		}
		const _add_row = (title) => {
			const cDiv = document.createElement('div');
			const hDiv = document.createElement('div');
			const pDiv = document.createElement('div');
			const h = document.createElement('h4');
			h.innerHTML = title;
			hDiv.classList = "visibility-selectors-header";
			hDiv.appendChild(h);
			cDiv.classList = "visibility-selectors"
			pDiv.appendChild(hDiv);
			pDiv.appendChild(cDiv);
			container.appendChild(pDiv);
			return [cDiv, hDiv];
		}
		columns.forEach((c) => {
			if (!c.hideable) return;
			const s = c.section;
			let cDiv = cDivs[s.title];
			if (cDiv === undefined){
				const r = _add_row(s.title);
				cDiv = r[0];
				const b1 = document.createElement('button');
				const b2 = document.createElement('button');
				const hDiv = r[1];
				b1.classList = "button-select-all";
				b2.classList = "button-deselect-all";
				b1.title = `Show all columns under '${s.title}'.`
				b2.title = `Hide all columns under '${s.title}'.`

				cDivs[s.title] = cDiv;
				hDiv.appendChild(b1);
				hDiv.appendChild(b2);

				b1.addEventListener('click', () => {_vis(true, s.title);});
				b2.addEventListener('click', () => {_vis(false, s.title);});
			}
			c.addEventListener('visibility-changed', () => { parent.request_redraw(); });
			c.create_visibility_selector(cDiv);
		})
		const [d1, _] = _add_row("");
		const b1 = document.createElement("button");
		const b2 = document.createElement("button");
		const b3 = document.createElement("button");
		const b4 = document.createElement("button");
		b1.innerText = "Reset Column Order";
		b1.title = "Reset column order to defaults."
		b2.innerText = "Reset Column Visibility";
		b2.title = "Reset column visibility to defaults."
		b3.innerText = "Show All Columns";
		b3.title = "Show all columns."
		b4.innerText = "Hide All Columns";
		b4.title = "Hide all columns (that can be hidden)."
		d1.appendChild(b1);
		d1.appendChild(b2);
		d1.appendChild(b3);
		d1.appendChild(b4);
		b1.addEventListener('click', () => { this.trigger_event('reset-column-order'); })
		b2.addEventListener('click', () => { _reset_visibility(); })
		b3.addEventListener('click', () => { _vis(true); })
		b4.addEventListener('click', () => { _vis(false); })

		const _reset_visibility = () => { for (let i = 0; i < columns.length; i++) columns[i].reset_visibility(); }

		this.__resetCallers.push(_reset_visibility);
	}
	reset(){
		for (let i = 0; i < this.__resetCallers.length; i++) this.__resetCallers[i]();
	}
}
