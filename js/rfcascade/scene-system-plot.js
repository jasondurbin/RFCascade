import {ScenePlot1D} from "../scene/plot-1d/scene-plot-1d.js";
import {linspace} from "../util.js";
/**
 * @import { ScenePlotManager } from "./scene-plot-manager.js"
 * @import { SysColumnHint } from "./columns.js"
 * */

const ICO_SIZE = 50;
export class SceneSystemPlot extends ScenePlot1D{
	static autoUpdateURL = false;
	/** @type {ScenePlotManager} */
	parent;
	/**
	 * Create global scene for System simulator.
	 *
	 * @param {ScenePlotManager} parent
	 * @param {HTMLDivElement} element
	 * @param {Number} counter
	 * @param {Object} loadPars
	 * */
	constructor(parent, element, counter, loadPars){
		const pre = "plot-" + String(counter);
		const chc = document.createElement('select');
		const lbl1 = document.createElement('label');
		const div1 = document.createElement('div');
		const div2 = document.createElement('div')
		const div3 = document.createElement('div');
		const but1 = document.createElement('button');
		const prefix = parent.prepend + "-" + pre;
		const axis = {};
		const _create_colormap = (pre) => {
			const div = document.createElement('div');
			const lbl = document.createElement('label');
			const sel = document.createElement('select');
			const cmk = pre + "-colormap"
			lbl.setAttribute('for', cmk);
			sel.id = cmk;
			sel.setAttribute('name', cmk);
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
		but1.innerHTML = 'Remove';
		but1.classList = "plot-button-remove"

		chc.id = prefix + "-choice";
		lbl1.setAttribute('for', chc.id);
		lbl1.innerText = "Parameter to Plot"
		div1.classList = "canvas-header";

		div1.appendChild(lbl1);
		div1.appendChild(chc);
		div1.appendChild(but1);

		element.appendChild(div1);
		element.appendChild(div2);
		element.appendChild(div3);

		div2.classList = "canvas-wrapper";
		const canvas = document.createElement("canvas");
		canvas.id = prefix;
		div2.appendChild(canvas);

		div3.appendChild(_create_colormap(prefix));
		div3.appendChild(_create_scale_controls(prefix));
		div3.classList = "canvas-footer";

		super(parent, canvas, pre + "-colormap");
		this.register_dom_event(chc, 'change', () => {
			this.needsSave = true;
			this.needsUpdate = true;
		})
		this.register_dom_event(this.cmap, 'change', () => {
			this.needsSave = true;
		})
		this.register_dom_event(but1, 'click', () => {
			this.delete();
		})
		this.register_dom_event(window, 'resize', () => {
			const m = this.get_magnification();
			if (m != this.magnification) this.redrawWaiting = true;
		})
		this.sys = parent.parent;
		this.install_axis_controls('y', axis);
		this.needsUpdate = true;
		this.needsSave = true;

		this.selector = chc;
		this.update_selector();
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
		this.addEventListener("axis-controls-change", () => { this.needsSave = true; })
	}
	delete(){
		this.selector.remove();
		super.delete();
	}
	update_selector(){
		const cols = this.sys.calc_columns;
		const sel = this.selector;
		for (let i = sel.options.length - 1; i >= 0; i--) sel.remove(0);

		const sections = {};
		const sorder = [];
		for (let i = 0; i < cols.length; i++){
			const c = cols[i];
			if (!c.currently_plottable) continue;
			const s = c.section.title;
			if (sections[s] === undefined){
				sections[s] = [];
				sorder.push(s);
			}
			sections[s].push(c);
		}

		for (let i = 0; i < sorder.length; i++){
			const s = sorder[i];
			let grp;
			for (let k = 0; k < sections[s].length; k++){
				if (k == 0){
					grp = document.createElement('optgroup');
					grp.setAttribute('label', s);
					sel.appendChild(grp);
				}
				const c = sections[s][k];
				this.register_dom_event(c, 'title-changed', (t) => { opt.innerHTML = t; });
				const opt = document.createElement('option');
				opt.innerHTML = c.selector_title;
				grp.appendChild(opt);
				opt.setAttribute('data-cls', c.constructor.name);
				opt.setAttribute('data-uindex', c.constructor.uindex);
			}
		}
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
		const cols = this.sys.columns;
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
		this.sys.blocks.forEach((b) => {
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
		const blocks = this.sys.blocks;

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
		const blocks = this.sys.blocks;
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
