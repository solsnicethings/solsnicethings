((()=> {
	
	let dom = component_registry[document.currentScript];
	dom = component_registry[dom].dom;
	
	let populate = async function() {
		let pages = await FetchFileList('pages');
		if (!pages) {
			dom.innerText = 'No pages were retrieved';
			return;
		}
		dom = dom.appendChild(document.createElement('links'))
		
		for (const p of pages) {
			let a = document.createElement('a');
			a.href = p;
			let x = /pages\/([^\/]+)\.[^\.\/]+$/.exec(p);
			if (x) a.innerText = x[1]; else a.innerText = p;
			dom.appendChild(a);
		}
	};
	
	populate();
		
})());