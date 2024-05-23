const CompleteComposeScript = PromiseAnything();
((async function () {
	let components = {}, early = { }, late = {   }, a_little_early = {        };
		
	function addcomponent(path, name, ext) {
		let exists = components[name];
		if (exists)
		switch (ext) {
			case 'early': case 'late': case 'forbid': break;
			case 'html':
			case 'txt':
				if (exists.txt || exists.html) return;
			default:
				if (exists.forbid || exists[ext]) return;
				break;
		}
		else exists = {};
		switch (ext) {
			case 'js': break;
			case 'forbid':
				components[name] = { forbid: true, dom: null };
				return;
			case 'early': early[name] = name; return;
			case 'late': late[name] = name; return;
			case 'html': case 'txt': path = fetch(path, { credentials: "omit" }); break;
			
			default:
				name += ':' + ext;
				if (!components[name]) components[name] = { getdoc: path };
				return;

		}
		exists[ext] = path;
		components[name] = exists;
	}

	let files = location.pathname;
	if (files) {
		files = /\/([^\/]+)$/.exec(files);
		if (files) {
			files = files[1];
			let x = /^(.+)\.[^\.]*$/.exec(files);
			if (x) files = x[1];
		}
	}
	if (files) a_little_early[files] = files;
	else files = 'index';
	files = await FetchFileList('components/byfilename/' + files, Ignore);
	
	if (files)
	
	for (const file of files) {
		let fileinfo  = /\/([^\/]+)\.([^\.\/]+)$/.exec(file);
		if (!fileinfo) continue;
		addcomponent(file, fileinfo[1], fileinfo[2]);
	}

	files = await FetchFileList('components/all');
	
	if (files)
		
	for (const file of files) {
		let fileinfo  = /\/([^\/]+)\.([^\.\/]+)$/.exec(file);
		if (!fileinfo) continue;
		addcomponent(file, fileinfo[1], fileinfo[2]);
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
						if (resolver.txt || resolver.html) jsprop = { placement: 'last', scope: 'header', containerElement: 'h1' };
						else jsprop = { placement: 'last',  scope: 'header', titleElement: 'h1', titleText: document.title, containerElement: null };
						break;
					case 'header':
						if (resolver.txt || resolver.html) jsprop = { placement: 'first', containerElement: 'header' };
						else jsprop = { placement: 'first', titleElement: null, containerElement: null };
						break;
					case 'footer':
						jsprop = { placement: 'last', containerElement: 'footer' };
						break;
					case 'main':
						jsprop = { containerElement: null };
						break;
					default:
						jsprop = { scope: 'main', query: 'td:not(:first-child:not(:empty))', titleElement: 'btn' , writenameattribute: 'activator' };
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
				if (scope) {
					scope = await ResolveIntoDom(scope);
					if (!scope) {
						if (scope === null) { resolver.dom = null; newResolution = true; }
						return;
					}
				}
				else scope = document.body;	
			}
		} finally { resolver.activetask = false; }
		
		if (jsprop.query) {
			if (scope) scope = scope.querySelector(jsprop.query);
		}
		if (!scope) {		
			if (resolver.getdoc) return resolver.dom = AddDocument(resolver[resolver.getdoc]);
		}
		
		let dom = jsprop.containerElement;
		if (dom) dom = document.createElement(dom); else dom = document.createElement('fetched');
		
		if (jsprop.titleText === undefined) jsprop.titleText = component;
		
		if (resolver.html) {
			dom.innerHTML = (await (await resolver.html).text()).trim();
			dom.className = 'html';
		} else {
			if (resolver.txt) {
				dom.appendChild(document.createElement('span')).appendChild(document.createTextNode( await (await resolver.txt).text() ));
				dom.className = 'txt';
			} else  dom.className = 'other';
			 if (jsprop.titleElement === undefined)
				 if (jsprop.scope == 'main') jsprop.titleElement = 'h3'; else jsprop.titleElement = 'h2';
		}
		if (jsprop.titleElement) dom.insertBefore(document.createElement(jsprop.titleElement), dom.firstChild).innerText = jsprop.titleText;
		if (resolver.getdoc) { AddDocument(resolver[resolver.getdoc], dom, true); }
		
		if (jsprop.containerElement === null) dom = dom.firstChild;
		if (jsprop.writenameattribute) resolver.writenameattribute = jsprop.writenameattribute;		
		
		if (dom && resolver.writenameattribute) dom.setAttribute(resolver.writenameattribute, component);
		
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
		
			let x = document.createElement('script');
			component_registry[x] = component;
			
			if (dom) dom.className += ' pendingscript';
			
			let y = PromiseEvent(x, 'load');
			
			x.setAttribute('src', resolver.js);
			document.head.appendChild(x);
			
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
		
		for (const check in early) if (components[check])
			if	(late[check]) { a_little_early[check] = check; delete late[check]; }
			else await ResolveIntoDom(check);
		for (const check in a_little_early) if (components[check] && !late[check]) await ResolveIntoDom(check);
		
		for (;;) {
			do { newResolution = false;
				for (const name in components) {
					if (late && late[name]) continue;
					await ResolveIntoDom(name);
				}
			} while (newResolution);
			
			if (late) { late = null; continue; }
			break;
		}
		
		for (let cdom in component_registry) {
			cdom = component_registry[cdom];
			if (cdom) { 
				cdom = cdom.dom;
				if (cdom && !cdom.classList.contains('pendingsub')) for (;;) {
					cdom = cdom.parentNode;
					if (!cdom) break;
					if (cdom.classList) cdom.classList.remove('pendingsub');
				}
			}
		}
		
		while (files = document.querySelector('.pendingsub')) files.parentNode.removeChild(files);
		while (files = document.querySelector('.pendingcontents:empty')) files.parentNode.removeChild(files);
		while (files = document.querySelector('.pendingcontents')) files.classList.remove('pendingcontents');
		
		document.body.classList.add('notImmediatelyCrashed');
		CompleteComposeScript.resolveIt();
	});
})());