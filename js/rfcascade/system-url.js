/**
 * @import {BlockHint} from "./blocks.js"
 * @import {SysColumnHint} from "./columns.js"
 * @import {SceneControlSystemCalc} from "../index.js"
 */
import {SysColumns} from "./columns.js"
import {SysBlocks} from "./blocks.js"
import {FindSceneURL} from "../scene/scene-util.js";

/** @type {Array<new () => SysColumnHint>} */
const _saveable = [];

const _checks = {'t': true};
SysColumns.forEach((e) => {
	if (e.save_key === null) return;
	if (_checks[e.save_key] !== undefined) throw Error(`Key ${e.save_key} is not unique.`);
	_checks[e.save_key] = true;
	_saveable.push(e);
});

/**
 * Create a URL saveable parameter set from block.
 *
 * @param {Array<BlockHint} blocks
 * */
export function save_blocks(blocks){
	const pars = [];
	blocks.forEach((b) => {
		const res = {};
		_saveable.forEach((c) => {
			const [k, v] = c.to_saveable(b);
			res[k] = v;
		})
		const _t = () => {
			for (let i = 0; i < SysBlocks.length; i++){
				if (SysBlocks[i].title == b.constructor.title) return i;
			}
			return 0;
		}
		res['t'] = _t();
		pars.push(res);
	});
	return pars;
}

/**
 * Save system.
 *
 * @param {SceneControlSystemCalc} sys
 * */
export function save_system(sys){
	const url = FindSceneURL();
	const config = {}
	config['b'] = save_blocks(sys.blocks);

	const vCols = [];
	sys.columns.forEach((c) => {
		vCols.push([c.constructor.uindex, c.visible])
	})

	const plots = [];
	sys.plots.forEach((p) => {
		plots.push(p.save_parameters)
	})

	config['c'] = vCols;
	config['p'] = plots;
	url.set_param('s', btoa(JSON.stringify(config)));
}

export function load_blocks(parent, configs){
	try{
		if (configs === null) return null;
		const blocks = [];
		for (let i = 0; i < configs.length; i++){
			const entry = configs[i];
			const t = entry['t'];

			const pars = {};
			_saveable.forEach((c) => {
				const [k, v] = c.from_saveable(entry);
				if (k !== null) pars[k] = v;
			});
			for (let i = 0; i < SysBlocks.length; i++){
				if (i == t) {
					blocks.push(new SysBlocks[i](parent, pars));
				}
			}
		}
		return blocks;
	}
	catch(e){
		console.log(e);
		return null;
	}
}

/**
 * Load system from URL.
 *
 * @param {SceneControlSystemCalc} sys
 * */
export function load_system(sys){
	load_system_uri(sys, FindSceneURL().get_param('s'));
}

/**
 * Load system for Base64 string.
 *
 * @param {SceneControlSystemCalc} sys
 * @param {String} uri
 * */
export function load_system_uri(sys, uri){
	const _parse = (k) => {
		try{ return JSON.parse(atob(k)); }
		catch(e){
			console.log(e);
			return null
		}
	}
	const _blocks = (config) => {
		try{ return load_blocks(sys, config['b']); }
		catch(e){
			console.log(e);
			return null;
		}
	}
	const _plots = (config) => {
		try{ return Array.from(config['p']); }
		catch(e){
			console.log(e);
			return null;
		}
	}
	const _cols = (config) => {
		let cdef;
		try{ cdef = config['c']; }
		catch(e){
			console.log(e);
			return null
		}
		try{
			const ncols = [];
			const scols = {};
			sys.calc_columns.forEach((c) => {
				if (c.position_fixed) ncols.push(c);
				else scols[c.constructor.uindex] = c;
			});
			for (const [k, v] of cdef){
				if (!scols.hasOwnProperty(k)) continue;
				ncols.push(scols[k]);
				scols[k].visible = v;
				delete scols[k];
			}
			sys.calc_columns.forEach((c) => {
				if (!ncols.includes(c)) ncols.push(c);
			})
			return ncols;
		}
		catch(e){
			console.log(e);
			return null;
		}
	}
	let blocks = null;
	if (uri !== null){
		const config = _parse(uri);
		if (config !== null) {
			blocks = _blocks(config);
			let vcols = _cols(config);
			if (vcols !== null) sys.columns = vcols;
			let pplots = _plots(config);
			if (pplots !== null){
				pplots.forEach((p) => {
					sys.add_plot(p)
				})
			}
		}
	}
	if (blocks !== null && blocks.length != 0) sys.blocks = blocks;
	else sys.blocks = sys.create_default_blocks();
}
