
export class SceneDOMEventHandler{
	constructor(){
		this._registeredEvents = [];
		this.isDeleted = false;
	}
	/**
	 * Register an event to a DOM element.
	 *
	 * This ensures the event is deleted when my object is deleted.
	 *
	 * @param {HTMLElement} ele
	 * @param {String} event
	 * @param {(...a:any) => {}} callback
	 * @param  {...any} args
	 */
	register_dom_event(ele, event, callback, ...args){
		this._registeredEvents.push({
			'ele': new WeakRef(ele),
			'event': event,
			'callback': new WeakRef(callback),
			'args': args
		});
		ele.addEventListener(event, callback, ...args);
	}
	delete(){
		for (let i = 0; i < this._registeredEvents.length; i++){
			const entry = this._registeredEvents[i];
			try{
				const ele = entry['ele'].deref();
				const func = entry['callback'].deref();
				if (!ele || !func) continue;
				ele.removeEventListener(entry['event'], func, ...entry['args']);
			}
			catch(e){ console.log(e); }
		}
		for (var prop in this) delete this[prop];
		this.isDeleted = true;
	}
}

export class SceneObjectEvent extends SceneDOMEventHandler{
	constructor(){
		super();
		this.eventTypes = new Set(['delete']);
		/** @type {Object<string, Array<(...a) => {}>} */
		this.listeners = {};
	}

	/**
	* Install an event listener similar to pure Javascript.
	*
	* Example events:
	*       `control-changed`: (controlname) => {}
	*
	* Classes that inherit this may add their own event types.
	* These can be viewed using calling `list_event_types()`
	* which return all valid event types.
	*
	* @param {String} event
	* @param {function(...):null} callback
	*
	* @return {null}
	* */
	addEventListener(event, callback){
		if (!(this.eventTypes.has(event))){
			throw Error(`'${event} is not a valid event. Expected: ${Array.from(this.eventTypes).join(', ')}`)
		}
		if (!(event in this.listeners)) this.listeners[event] = [];
		this.listeners[event].push(callback);
	}
	removeEventListener(event, callback){
		if (!(this.eventTypes.has(event))){
			throw Error(`'${event} is not a valid event. Expected: ${Array.from(this.eventTypes).join(', ')}`)
		}
		if (!(event in this.listeners)) return;
		const grp = this.listeners[event];
		this.listeners[event] = [];
		for (let i = 0; i < grp.length; i++){
			if (grp[i] == callback) continue;
			this.listeners[event].push(grp[i]);
		}
	}
	async trigger_event(event, ...args){
		if (!(this.eventTypes.has(event))){
			throw Error(`'${event} is not a valid event to trigger.`)
		}
		if (!(event in this.listeners)) return;
		for (const func of this.listeners[event]) await func(...args);
	}
	list_event_types(){ return this.eventTypes; }
	add_event_types(...args){ this.eventTypes = this.eventTypes.union(new Set(args)); }
	delete(){
		this.trigger_event('delete');
		super.delete();
	}
}
