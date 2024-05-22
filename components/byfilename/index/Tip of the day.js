((()=> {
	
	let dom = component_registry[document.currentScript];
	dom = component_registry[dom].dom;
	
	let tip = [
		{"tipByDay[Math.floor(new Date().getTime()/8.64e7) % tips.length]":
			'https://stackoverflow.com/questions/12739171/javascript-epoch-time-in-days'
		},
		{"For application/x-www-form-urlencoded, spaces are to be replaced by +, so one may wish to follow a encodeURIComponent() replacement with an additional replacement of %20 with +.":
			'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent'
		}
	];

	tip = tip[Math.floor(new Date().getTime()/8.64e7) % tip.length];

	for (const k in tip) {
		let e = dom.appendChild( document.createElement('p') );
		e.style.whiteSpace = 'pre-wrap';
		e.innerText = k;
		dom.appendChild('cite').innerText = tip[k];
	}
		
})());