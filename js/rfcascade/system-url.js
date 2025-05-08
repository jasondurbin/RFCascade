/**
 * @import {BlockHint} from "./blocks.js"
 * @import {SysColumnTypeHint, SysColumnHint} from "./columns.js"
 * @import {SceneControlSystemCalc} from "../index.js"
 */
import {SysColumns} from "./columns.js"
import {SysBlocks} from "./blocks.js"
import {FindSceneURL} from "../scene/scene-util.js";

/** @type {Array<SysColumnTypeHint>} */
const _saveable = [];
const _block_loader = {};
let maxKey;

function _check_loadability(){
	const _checks = {0: null};
	for (let i = 0; i < SysColumns.length; i++){
		const e = SysColumns[i];
		if (e.save_key === null) continue;
		const s = Number(e.save_key);
		if (s != e.save_key) throw Error(`Key ${e.save_key} is not a number (${e.title}).`)
		if (_checks[s] !== undefined) throw Error(`Key ${e.save_key} is not unique (${e.title}).`);
		_checks[s] = e;
	}
	maxKey = Math.max(...Object.keys(_checks)) + 1;
	for (let i = 0; i < maxKey; i++){
		if (_checks.hasOwnProperty(i)) _saveable.push(_checks[i]);
		else throw Error(`No saveable parameter at index ${i}.`)
	}
	SysBlocks.forEach((c) => {
		const s = Number(c.load_index);
		if (s != c.load_index) throw Error(`Key ${c.load_index} is not a number (${c.title}).`)
		if (_block_loader[s] !== undefined) throw Error(`Key ${c.load_index} is not unique (${c.title}).`);
		_block_loader[s] = c;
	});
}
_check_loadability();
/**
 * Create a URL saveable parameter set from block.
 *
 * @param {Array<BlockHint} blocks
 * */
export function save_blocks(blocks){
	const pars = [];
	blocks.forEach((b) => {
		const res = [];

		const _t = () => {
			for (let i = 0; i < SysBlocks.length; i++){
				if (SysBlocks[i].title == b.constructor.title) return b.constructor.load_index;
			}
			return SysBlocks[0].load_index;
		}
		for (let i = 0; i < _saveable.length; i++){
			let v;
			if (i == 0) v = _t();
			else v = _saveable[i].to_saveable(b);
			res.push(v);
		}
		pars.push(res);
	});
	return pars;
}

/**
 * Save system.
 *
 * @param {SceneControlSystemCalc} sys
 * */
export function save_system_url(sys){
	const url = FindSceneURL();
	const config = save_system_config(sys);
	url.clear();
	for (const [k, v] of Object.entries(config)) url.set_param(k, JSON.stringify(v));
}
/**
 * Save system.
 *
 * @param {SceneControlSystemCalc} sys
 * */
export function save_system_config(sys){
	return {
		'b': save_blocks(sys.blocks),
		'c': sys.save_columns(),
		'g': sys.globals.save_parameters(),
		'p': sys.plotManager.save_parameters(),
	}
}

export function load_blocks(parent, configs){
	try{
		if (configs === null) return null;
		const blocks = [];
		for (let i = 0; i < configs.length; i++){
			const entry = configs[i];
			const pars = {};
			for (let i = 1; i < _saveable.length; i++){
				const c = _saveable[i];
				const v = c.from_saveable(entry);
				if (v !== null) pars[c.key] = v;
			}
			const kls = _block_loader[entry[0]];
			if (kls === undefined) throw Error(`Block with load index ${entry[0]} not found.`)
			blocks.push(new kls(parent, pars));
		}
		return blocks;
	}
	catch(e){
		log_loading_error(e);
		return null;
	}
}

export function load_system_config(sys, config){
	let blocks = null;
	let success = true;
	const bc = config['b'];
	const _log = (e) => {
		success = false;
		log_loading_error(e);
	}
	if (bc !== null && bc !== undefined){
		try{
			blocks = load_blocks(sys, bc);
			console.log(`${blocks.length} block(s) loaded...`)
		}
		catch(e){ _log(e); }
	}
	const cc = config['c'];
	if (cc !== null && cc !== undefined){
		try{ sys.load_columns(cc); }
		catch(e){ _log(e); }
	}
	const gc = config['g'];
	if (gc !== null && gc !== undefined){
		try{ sys.globals.load(gc); }
		catch(e){ _log(e); }
	}
	const pc = config['p'];
	if (pc !== null && pc !== undefined){
		try{ sys.plotManager.load(pc); }
		catch(e){ _log(e); }
	}
	if (blocks !== null && blocks.length != 0) sys.blocks = blocks;
	else sys.blocks = sys.create_default_blocks();
	return success;
}
/**
 * Load system from URL.
 *
 * @param {SceneControlSystemCalc} sys
 * */
export function load_system_url(sys){
	const config = {};
	const url = FindSceneURL();
	['b', 'c' , 'g', 'p'].forEach(k => {
		const c = url.get_param(k);
		if (c === null || c === undefined) return;
		try{
			config[k] = JSON.parse(c);
		}
		catch(e){ log_loading_error(e); }
	})
	return load_system_config(sys, config);
}

export function log_loading_error(e){
	console.log("Uncaught error has occured. If you see this message, report the error below to developer.");
	console.log("----- Start Error");
	console.log(e);
	console.log("----- End Error");
}

/**
 * Load system for Base64 string.
 *
 * @param {SceneControlSystemCalc} sys
 * @param {String} uri
 * */
export function load_system_uri(sys, uri){
	const _parse = (k) => {
		try{ return JSON.parse(k); }
		catch(e){
			log_loading_error(e);
			return null
		}
	}
	const _blocks = (config) => {
		try{ return load_blocks(sys, config[0]); }
		catch(e){
			log_loading_error(e);
			return null;
		}
	}
	const _plots = (config) => {
		try{ return Array.from(config[3]); }
		catch(e){
			log_loading_error(e);
			return null;
		}
	}
	const _globs = (config) => {
		try{ return config[2]; }
		catch(e){
			log_loading_error(e);
			return null;
		}
	}
	const _cols = (config) => {
		let cdef;
		try{ cdef = config[1]; }
		catch(e){
			log_loading_error(e);
			return null
		}
		try{
			const ncols = [];
			const scols = {};
			const ocols = {};
			sys.calc_columns.forEach((c) => {
				if (c.position_fixed) {
					ncols.push(c);
					ocols[c.constructor.uindex] = c;
				}
				else scols[c.constructor.uindex] = c;
			});
			for (const entry of cdef){
				let k, v;
				try{
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
			sys.calc_columns.forEach((c) => {
				if (!ncols.includes(c)) ncols.push(c);
			})
			return ncols;
		}
		catch(e){
			log_loading_error(e);
			return null;
		}
	}
	let blocks = null;
	if (uri !== null){
		const config = _parse(uri);
		if (config !== null) {
			let globs = _globs(config);
			sys.globals.load(globs);
			blocks = _blocks(config);
			let vcols = _cols(config);
			if (vcols !== null) sys.columns = vcols;
			let pplots = _plots(config);
			if (pplots !== null){
				sys.plotManager.load(pplots);
			}
		}
	}
	if (blocks !== null && blocks.length != 0) sys.blocks = blocks;
	else sys.blocks = sys.create_default_blocks();
}
