var keyStates;
	// reassign keyStates to clear unconsumed keypresses (doesn't stop keyboard events from firing based on already held buttons)

const keyInactive = 0, keyPressed = 1, keyHeld = 2, keyReleased = 4, keyConsumed = 8;

let currentKeyboardEventHandler;

	/* eventprefix includes the colon
	{
		"meta": (keyboardEvent) => keyStates is about to be reset because windows key
		"any": (keyboardEvent) => any keyboard event
		"press:KeyRight": (keyboardEvent) => only when named key is pressed
		"repeat:KeyRight": ... => only on repeat fires of keydown
		"hold:KeyRight": ... => initial and repeat keydown
		"release:KeyRight": ... => keyup
		"KeyRight": ... => every keyup and keydown
		
		Only the most precise handler is used
			(max precision: press / repeat / release > mid precision: hold > min precision: no qualifier)
			
		Calling preventDefault() causes the keyStates for the press to be consumed
	}
	*/
	
(( () => {
	
	let filterExclude , filterSelection ;
	
	window.setMonitoredKeys(selection, excludeSelected) {
		// keyStates only tracks monitored keys; either those in selection, or if excludeSelected is true, those not in selection
		// tracked keys have their default prevented and get stopPropagation called at the document node
		// this filter does not affect whether a key/event specific handler is called and passed the keyboard event
		// calling this funtion rests keyStates without issuing any events
		
		if (!selection) selection = [];
		else if (!Array.isArray(selection)) selection = [selection];
		
		filterExclude = excludeSelected;
		filterSelection = selection;
		keyStates = {};
	};
	
	setMonitoredKeys([], true); // monitor all, deny all default operations that have not already occurred
		
	window.monitorKeyEvent = (eventprefix, rawEvent, handler = currentKeyboardEventHandler) => {
		if (e.metaKey) {
			if (handler) {
				handler = handler['meta'];
				if (handler) handler(rawEvent);
			}
			keyStates = {};
			return;
		}
		
		let id = keyEventToKeyId(rawEvent), h;
		
		if (handler && !rawEvent.defaultPrevented) {
			h = handler[eventprefix + id];
			if (!h)
			{
				if (eventprefix == 'release:') h = handler[id] ?? handler['any'];
				else h = handler['hold:' + id] ?? handler[id] ?? handler['any'];
			}
			if (h) h(rawEvent);
		}
		
		if (filterSelection.indexOf(id) < 0 && filterSelection(rawEvent.code) < 0) {
			if (!filterExclude) return false;
		} else if (filterExclude) return false;
		
		switch (eventprefix) {
			case 'release:':
				h = keyStates[id];
				if (h) {
					if (h & keyConsumed) keyStates[id] = keyInactive;
					else keyStates[id] = h | keyReleased;
				}
				break;
			case 'repeat:':			
				keyStates[id] = keyStates[id] == keyPressed ? ( keyHeld | keyPressed ) : keyHeld;
				break;
			default:
				keyStates[id] = keyPressed;
				break;
				
		}
			
		if (rawEvent.defaultPrevented) consumeKey(id);
		else rawEvent.preventDefault();
		rawEvent.stopPropagation();
		
		return true;
	};
	
} )());


/* valid states:
		inactive - not pressed
		
		pressed - is pressed, not yet released, not yet consumed (by app code)
		pressed | consumed - pressed state has been consumed, no repeat or release has triggered yet
		
		held - pressed, preceding held or held | pressed has been consumed, latest repeat from holding down has not been detected
		held | pressed - press and repeat from holding down have both occurred, neither consumed
		held | consumed - held or held | pressed has been consumed
		
		released | pressed
		released | held
		released | held | pressed
			these will all be overwritten by any new press of the same keyid
			they indicate a press that has ended without being consumed
			consuming it changes it to inactive
		
*/

function keyEventToKeyId(e) {
	switch (e.location) {
		case 1: return 'LEFT ' + e.code;
		case 2: return 'RIGHT ' + e.code;
		case 3: return 'NUMPAD ' + e.code;
	}
	return e.code;
}

(( () => {

	let keyAwaiter = null;
	let signaled = false;
	
	let signalKeyAwaiter = () => {
		if (signaled || !keyAwaiter) return;
		signaled = true;
		setTimeout(() => { signaled = false; let e = keyAwaiter; keyAwaiter = null; e.resolveIt(); }, 0);
	}
	
	window.getKeyAwaitable = () => {
		if (keyAwaiter === null) keyAwaiter = PromiseAnything();
		return keyAwaiter.chainThen();
	};
	
	document.addEventListener('keyup', e => {
		if (monitorKeyEvent('release:', e)) signalKeyAwaiter();
	});
	document.addEventListener('keydown', e => {
		if (monitorKeyEvent(e.repeat ? 'repeat:' : 'press:', e)) signalKeyAwaiter();
	});
	
} )());
	
function consumeKey(keyId) {
	// Attention: consume returns non-0 for previously pressed keys if they have not been consumed since the last keydown they fired
	// Attention: consume returns 0 for currently pressed keys if their most recent event has been consumed
	
	let s = keyStates[keyId];
	
	if (s === undefined) return keyInactive;
	if (s & keyReleased) {
		delete keyStates[keyId];
		return s;
	}
	switch (s) {
		case keyPressed: keyStates[keyId] = keyPressed | keyConsumed; return keyPressed;
		case keyHeld: case keyHeld | keyPressed: keyStates[keyId] = keyHeld | keyConsumed; return s;
	}
	
	return keyInactive;
}

function checkKey(keyId) {
	// causes the key to be consumed, but returns non-0 if the key is currently pressed and 0 if it is not
	
	let s = keyStates[keyId];
	consumeKey(keyId);
	if (s && !(s & keyReleased)) return s;
	return keyInactive;
}

function consumeKeys() {
	// consume key, but returning all keys that would report as pressed/held, or null if there are none
	// data returned as a n object with key ids as properties and values combining key... pressed|held|released
	
	let result = null;
	
	for (const key in keyStates) {
		let s = keyStates[key];
		if (s && !(s & keyConsumed))
			if (result) result[key] = s;
			else result = { key: s };
	}
	
	keyStates = {};
	return result;
}

async function awaitKeys(keys, awaitPress = true, awaitRelease) {
	if (!Array.isArray(keys)) keys = [keys];
	
	// if awaitPress, wait until at least one of the keys is pressed
	// if awaitRelease, wait until none of the keys are pressed (returns null immediately if none are pressed and awaitPress is false)
	// if none of the keys are detected, return null
	// otherwise, return an object where each detected key id is a property
	// the value of each property is a combination of all the key's detected states
	// consumes keys immediately before completion, and upon detecting the keyReleased state
	
	let detected = null;
	
	for (;;) {
		for (const keyId of keys) {
			let state = keyStates[keyId];
			if (state) {
				if (state & keyReleased) keyStates[keyId] = keyInactive;
				else if (detected === null) detected = { keyId: state };
				else detected[keyId] = state;
			}
		}
		if (detected !== null) break;
		if (!awaitPress) return null;
		await getKeyAwaitable();
	}
	
	if (awaitRelease) {
		for (;;) {
			await getKeyAwaitable();
			
			let states = keyInactive;
			for (const keyId of keys) {
				let state = keyStates[keyId];
				if (state) {
					if (state & keyReleased) keyStates[keyId] = keyInactive;
					else { states |= state; detected[keyId] |= state; }
				}
			}
			
			if (states == keyInactive) break;
		}
	}
	
	for (const keyId of keys) consumeKey(keyId);	
	return detected;
}

function createMenu(options, optionHtmlGenerator, containerElement = 'table') {
	if (typeof containerElement === "string") containerElement = document.createElement(containerElement);
	for (const opt of options) {
		let o;
		
		if (optionHtmlGenerator) o = optionHtmlGenerator(opt);
		if (o === undefined)
	}
}