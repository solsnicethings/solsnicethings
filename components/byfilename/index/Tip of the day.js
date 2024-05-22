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

	for (let k in tip) {
		let e = dom.appendChild( document.createElement('p') );
		e.style.whiteSpace = 'pre-wrap';
		e.innerText = k;
		k = tip[k];
		dom.appendChild(document.createElement('cite')).innerText = k;

		if (/^[hH][tT][tT][pP][sS]:\/\/./.exec(k)) {
			try { new URL(k); } 			catch { continue }
			e = document.createElement('a');
			e.innerText = ' [OPEN (in new tab/window)]';
			e.setAttribute('href', k);
			e.setAttribute('target', '_blank');
			e.style.display = 'block';
			e.style.position = 'absolute';
			dom.appendChild(e);
		}
	}
		
})());