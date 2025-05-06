export class SceneObjectEvent{
	constructor(){
		this.eventTypes = new Set([]);
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
	async trigger_event(event, ...args){
		if (!(this.eventTypes.has(event))){
			throw Error(`'${event} is not a valid event to trigger.`)
		}
		if (!(event in this.listeners)) return;
		for (const func of this.listeners[event]){ await func(...args); }
	}
	list_event_types(){ return this.eventTypes; }
	add_event_types(...args){ this.eventTypes = this.eventTypes.union(new Set(args)); }
}
