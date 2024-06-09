var keyStates = [];
	// reassign keyStates to clear unconsumed keypresses (doesn't stop keyboard events from firing based on already held buttons)

const keyInactive = 0, keyPressed = 1, keyHeld = 2, keyReleased = 4, keyConsumed = 8;

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
		if (signaled) return;
		if (keyAwaiter) {
			signaled = true;
			setTimeout(() => { signaled = false; let e = keyAwaiter; keyAwaiter = null; e.resolveIt(); }, 0);
		}
	}
	
	window.getKeyAwaitable = () => {
		if (keyAwaiter === null) keyAwaiter = PromiseAnything();
		return keyAwaiter.chainThen();
	};
	
	document.addEventListener('keyup', e => {
		if (e.metaKey) keyStates = [];
		else
		{
			e = keyEventToKeyId(e);
			let s = keyStates[e];
			if (s) {
				if (s & keyConsumed) keyStates[e] = keyInactive;
				else keyStates[e] = s | keyReleased;
			}
		}
		signalKeyAwaiter();
	});
	document.addEventListener('keydown', e => {
		if (e.metaKey) keyStates = [];
		else if (e.repeat) {
			e = keyEventToKeyId(e);
			if (keyStates[e] == keyPressed) keyStates[e] = keyHeld | keyPressed;
			else keyStates[e] = keyHeld;
		}
		else keyStates[keyEventToKeyId(e)] = keyPressed;
		signalKeyAwaiter();
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