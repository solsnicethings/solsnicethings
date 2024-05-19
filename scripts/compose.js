var loading_dom_target;

((async function () {
	let components = {};
		
	function addcomponent(path, name, ext) {
		let exists = components[name];
		if (exists)
		switch (ext) {
			case 'html':
			case 'txt':
				if (exists.txt || exists.html) return;
			default:
				if (exists.forbid || exists[ext]) return;
				break;
		}
		else exists = {};
		switch (ext) {
			case 'css':
				name += ':' + ext;
				if (!components[name]) components[name] = { special: ext, ext: path };
				return;

			case 'js': break;
			case 'forbid':
				components[name] = { forbid: true, dom: null };
				return;
			default: path = fetch(path, { credentials: "omit" });
		}
		exists[ext] = path;
		components[name] = exists;
	}
	
	let files = /(^|\/)([^\/]+)(\.[^\.]+)?$/.exec(window.location);
	if (files) {
		if (files[1] + files[2] == window.location) files = 'index';
		else files = files[2];
	} else files = 'index';
	files = await FetchFileList('/components/byfilename/' + files);
	
	if (files)
	
	for (const file of files) {
		let fileinfo  = /(^|\/)([^\/]+)\.([^\.]+)$/.exec(file);
		if (!fileinfo) continue;
		addcomponent(file, fileinfo[2], fileinfo[3]);
	}

	files = await FetchFileList('/components/all');
		
	for (const file of files) {
		let fileinfo  = /(^|\/)([^\/]+)\.([^\.]+)$/.exec(file);
		if (!fileinfo) continue;
		addcomponent(file, fileinfo[2], fileinfo[3]);
	}
	
	let newResolution;
	
	async function ResolveIntoDom(component) {
		let resolver = components[component];
				
		if (resolver === undefined)
		{
			resolver = document.getElementById(component);
			if (resolver) return resolver;
			resolver = { writenameattribute: 'id' };
		}
		else if (resolver.activetask) { resolver.dom = null; return null; }
		else if (resolver.dom !== undefined) return resolver.dom;
		
		switch (resolver.special) {
			
			case 'css':
				LinkStylesheet(resolver.css);
				resolver.dom = null;
				return null;

		}
		
		let scope, jsprop = resolver.jsprop;
		
		resolver.activetask = true;
		try {
			if (jsprop) {
				if (jsprop.then)
				{
					jsprop = await (await jsprop).json();
					resolver.jsprop = jsprop;
				}
			} else {
				switch (component) {
					case 'title':
						if (resolver.txt || resolver.html) jsprop = { placement: 'first', scope: 'header', containerElement: 'h1' };
						else jsprop = { placement: 'first',  scope: 'header', titleElement: 'h1', titleText: document.title, containerElement: null };
						break;
					case 'header':
						if (resolver.txt || resolver.html) jsprop = { placement: 'first', containerElement: 'header' };
						else jsprop = { placement: 'first', titleElement: null, containerElement: null };
						break;
					case 'footer':
						jsprop = { placement: 'last' };
						break;
					case 'main':
						jsprop = {};
						break;
					default:
						jsprop = { scope: 'main' };
				}
			}
			
			scope = jsprop.dependency;
			if (scope) {
				if (Array.isArray(scope)) for (const d of scope) await ResolveIntoDom(d);
				else await ResolveIntoDom(scope);
			}
			
			scope = jsprop.tryscope;
			if (scope) scope = await ResolveIntoDom(scope);
			
			if (!scope) {
				scope = jsprop.scope;
				if (scope) { scope = await ResolveIntoDom(scope); if (!scope) return; }
				else scope = document.body;	
			}
		} finally { resolver.activetask = false; }
			
		if (jsprop.query) {
			scope = scope.querySelector(jsprop.query);
			if (!scope) return;
		}
		
		let dom = jsprop.containerElement;
		if (dom) dom = document.createElement(dom); else dom = document.createElement('fetched');
		
		if (jsprop.titleText === undefined) jsprop.titleText = component;
		
		if (jsprop.titleElement) dom.appendChild(document.createElement(jsprop.titleElement)).innerText = jsprop.titleText;
		
		if (resolver.html) {
			dom.innerHTML = (await (await resolver.html).text()).trim();
			dom.className = 'html';
		} else {
			if (resolver.txt) {
				dom.innerText = await (await resolver.txt).text();
				dom.className = 'txt';
			} else  dom.className = 'other';
			if (jsprop.titleElement === undefined && jsprop.scope == 'main')
				dom.insertBefore(document.createElement('h3'), dom.firstChild).innerText = jsprop.titleText;
		}
		
		if (jsprop.containerElement === null) dom = dom.firstChild;
		
		if (dom && jsprop.writenameattribute) dom.setAttribute(jsprop.writenameattribute, component);
		
		if (jsprop.requiresSubcomponents)
			dom.className += ' pendingsub';
		if (jsprop.requiresContents)
			dom.className += ' pendingcontents';

		resolver.dom = dom;
		newResolution = true;
				
		if (dom) {
			component_registry[component] = { dom: dom };
			
			let x = dom.parentNode;
			let y;
			
			switch (jsprop.placement) {
				case 'before':
					scope.parentNode.insertBefore(dom, scope);
					files[dom] = files[scope];
					break;
				case 'after':
					scope.parentNode.insertBefore(dom, scope.nextSibling);
					files[dom] = files[scope];
					break;
				case 'first':
					scope.insertBefore(dom, scope.firstChild);
					files[dom] = 'first';
					break;
				case 'last':
					scope.appendChild(dom);
					files[dom] = 'last';
					break;
				default:
					for (y = scope.firstChild; y && files[y] == 'first'; y = y.nextSibling);
					scope.insertBefore(dom, y);				
			}
			
			if (x) {
				y = dom.nextSibling;
				while (x.firstChild) {
					switch (x.firstChild.nodeType) {
						case 2: // attribute
						case 7: // proc instruction
						case 8: // comment
							x.removeChild(x.firstChild);
							break;
						default:
							if (x.tagName == 'SCRIPT') x.removeChild(x.firstChild);
							else scope.insertBefore(x.firstChild, y);
					}
				}
			}
		}

		if (resolver.js) {
		
			let x = document.createElement(script);
			component_registry[x] = component;
			
			if (dom) dom.className += ' pendingscript';
			
			let y = PromiseEvent(x, 'load');
			
			x.setAttribute('src', resolver.js);
			document.body.appendChild(x);
			
			await y;
			if (dom) dom.classList.remove('pendingscript');
		}
		
		return dom;
	}
	
	RunWhenDomReady(async function() {
	
		if (components.title === undefined) {
			components.title = { };
		}
		
		files = {};
		
		do { newResolution = false;
			for (const name in components) {
				await ResolveIntoDom(name);
			}
		} while (newResolution);
		
		for (let cdom in component_registry) {
			cdom = component_registry[cdom];
			if (cdom) { 
				cdom = cdom.dom;
				if (cdom && !cdom.contains('pendingsub')) for (;;) {
					cdom = cdom.parentNode;
					if (!cdom) break;
					cdom.classList.remove('pendingsub');
				}
			}
		}
		
		while (files = document.querySelector('.pendingsub')) files.parentNode.removeChild(files);
		while (files = document.querySelector('.pendingcontents:empty')) files.parentNode.removeChild(files);
		while (files = document.querySelector('.pendingcontents')) files.classList.remove('pendingcontents');
	});
})());
