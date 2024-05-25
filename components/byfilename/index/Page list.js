((()=> {
	
	let dom = component_registry[document.currentScript];
	dom = component_registry[dom].dom;
	
	let populate = async function() {
		let pages = {};
		for (const cpage of (await FetchFileList('components/byfilename', null, null)))
		{
			let x = /\/([^\/]+)$/.exec(cpage);
			pages[x[1]] = 'template.html?pagesource=' + cpage;
		}
		for (const page of (await FetchFileList('pages'))) {
			let x = /pages\/([^\/]+)\.[^\.\/]+$/.exec(page);
			if (x) x = x[1]; else x = page;
			pages[x] = page;
		}

		dom = dom.appendChild(document.createElement('buttons'))
		
		for (const p in pages) {
			let a = document.createElement('a');
			a.href = pages[p];
			a.innerText = p;
			dom.appendChild(a);
		}
		
		if (!dom.firstChild) {
			dom.innerText = 'No pages were retrieved';
			return;
		}
	};
	
	populate();
		
})());