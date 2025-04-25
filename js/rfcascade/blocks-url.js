/**
 * @import {BlockHint} from "./blocks.js"
 * @import {SysColumnHint} from "./columns.js"
 */
import {SysColumns} from "./columns.js"
import {SysBlocks} from "./blocks.js"

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
	return JSON.stringify(pars);
}

export function load_blocks(parent, pars){
	let configs;
	try{
		configs = JSON.parse(pars);
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
