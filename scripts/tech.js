async function FetchFileList(path, exceptionHandler) {
	
	const response = await fetch('https://api.github.com/repos/' + github_user + '/' + github_repo + '/contents/' + path, { credentials: "omit" });
	
	if (!response.ok) {
			if (exceptionHandler) exceptionHandler(response);
			else {
				exceptionHandler = ShowDiagnostic(response.status, 'errormsg');
				response.json().then(result => { if (result.message) exceptionHandler.innerText += ': ' + result.message; });
			}
			return;
	}
	
	const data = await response.json();	
	
	let filelist = [];
	
	for (let file of data) {
		if (file.type == 'file') {
			file = file.path;
			if (!file.startsWith('/')) file = '/' + file;
			filelist.push(file); 
		}
	}
	
	return filelist;
}

function Ignore() {}

function AddScript(src, returnLoadPromise = false, target = document.head) {
	src = src.toLowerCase();
	if (!/\//.exec(src)) src = '/scripts/plugin/' + src;
	if (!/\.js$/.exec(src)) src += '.js';
	let e = component_registry[src];
	if (e) 
		if (returnLoadPromise) return Promise.resolve(e);
		else return src;

	e = document.createElement('script');
	e.src = src;
	component_registry[src] = e;
	
	if (returnLoadPromise) src = PromiseEvent(e, 'load');
	
	target.appendChild(e);
	return src;
}
function AddDocument(srchref, target = null) {
	let x = component_registry[srchref];
	if (!x) {
		x = /\.[^\/\.]+$/.exec(srchref);
		if (x)
			switch (x[0].toLowerCase()) {
				case '.css':
				x = document.createElement('link');
				x.setAttribute('href', srchref);
				x.setAttribute('rel', 'stylesheet');
				x.setAttribute('type', 'text/css');
				break;
				
				case '.jpg': case '.svg': case '.png': case '.bmp':
				case '.jpeg': case '.gif':
				x = document.createElement('img');
				x.setAttribute('src', srchref);
				break;
				
				default: x = null; break;
			}
		if (!x) {
			if (target != document.head) {
				if (target === null) target = document.body;
				x = document.createElement('iframe');
				x.setAttribute('src', srchref);
			}
		}
		component_registry[srchref] = x;
	}
	if (target === null) target = document.head;
	if (target != x.parentNode) target.appendChild(x);
	if (x) return x;
	return null;
}

function ShowDiagnostic(message, elementTypeOverride = 'diagnostic') {
	let e = document.createElement(elementTypeOverride);
	e.className = 'diagnostic';
	e.innerText = message;
	//RunWhenDomReady(()=>{document.body.insertBefore(e, document.querySelector('body > footer:last-of-type'))});
	RunWhenDomReady(()=>{
		document.body.appendChild(e);
		let o = component_registry['diagnostic:observer'];
		if (!o) { component_registry['diagnostic:observer'] = o = new MutationObserver( () => {
			let x = document.body.lastChild;
			if (!x || (x.nodeType == 1 && x.className == 'diagnostic')) return;
			let a = null, s = x.previousElementSibling;
			for (; s && s.className == 'diagnostic'; s = s.previousElementSibling) a = s;
			if (!a) return;
			for (s = x.previousSibling;; s = s.previousSibling) {
				document.body.insertBefore(x, a);
				if (!s || (s.nodeType == 1 && s.className == 'diagnostic')) return;
				a = x;
				x = s;
			}
		});}
		o.observe(document.body, { childList: true });			
	});
	return e;
}

function PromiseEvent(target, event) {
  return new Promise((resolve) => {
    const listener = () => {
      target.removeEventListener(event, listener);
      resolve(target);
    }
    target.addEventListener(event, listener);
  })
}
function PromiseAnything() {
	let promise, resolve, reject;
	promise = new Promise((y, n) => {
		resolve = y;
		reject = n;
	});
	return {
		resolveIt: resolve,
		rejectIt: reject,
		
		chainThen: (f,r) => { return promise = promise.then(f,r); },
		chainCatch: f => { return promise = promise.catch(f); }		
	};
}

function RunWhenDomReady(e, d = document) {
	if (d instanceof HTMLDocument && d.readyState == "loading") {
		d.addEventListener("DOMContentLoaded", e);
	} else if (d instanceof HTMLIFrameElement) {
		if (d.contentDocument) RunWhenDomReady(e, d.contentDocument);
		else d.contentWindow.addEventListener("load", e);
	} else { e(); }
}
function RunWhenLoaded(e, n = document) {
	if (n instanceof HTMLDocument) {
		if (n.readyState === "complete") { e(); return; }
		n = n.defaultViewport;
	} else if (n instanceof HTMLIFrameElement) {
		if (n.contentDocument) RunWhenLoaded(e, n.contentDocument);
		else n.contentWindow.addEventListener("load", e);
		return;
	}
	n.addEventListener("load", e);
}

RunWhenDomReady(()=>{
	let purgenotifs = document.createElement('action');
	purgenotifs.innerText = 'purge diagnostic messages';
	purgenotifs.addEventListener('click', x => {
		x = component_registry['diagnostic:observer'];
		if (x) x.disconnect();
		for (;;) {
			x = document.querySelector('.diagnostic');
			if (!x) return;
			x.parentNode.removeChild(x);
		}
	});
	document.body.appendChild(purgenotifs);
	document.addEventListener('change', e => {
		//label:not([for]) > input[type="radio"]:first-of-type:last-of-type,
		//label:not([for]) > input[type="checkbox"]:first-of-type:last-of-type	
		e = e.target;
		if (e.tagName == 'INPUT' && e.parentNode.tagName == 'LABEL' &&
			!e.parentNode.hasAttribute('for') &&
			e.parentNode.querySelector(':scope > input:first-of-type:last-of-type'))
			switch (e.getAttribute('type'))
			{
				case 'radio': case 'checkbox':
					if (e.checked) e.parentNode.setAttribute('input-checked', '');
					else e.parentNode.removeAttribute('input-checked');
			}
		
	});
		
	CompleteComposeScript.chainThen(()=>{
		let e = document.createElement('a');
		e.className = 'helplink unbed';
		e.setAttribute("href", "?reload");
		e.innerText = 'Reload page components';
		e.style['float'] = 'right';
		document.body.insertBefore(e, document.body.firstElementChild);
		e = document.querySelector('body > footer:last-of-type');
		if (e) e.insertBefore(purgenotifs, e.firstElementChild);
		
		if (urlSearchParams.has('embedded')) {
			document.body.classList.add('embedded');
			if ( parent && parent.component_registry) {
				e = parent.component_registry[window];
				if (e) {
					e(getComputedStyle(document.documentElement).height);
					let o = new ResizeObserver(entries => {
						e(getComputedStyle(document.documentElement).height);
					});
					o.observe(document.documentElement, { box: "border-box" });
				}
			}
		}
	});
});

((() => {
	if (!urlSearchParams.has('reload')) return;
	
	const nativeFetch = fetch;
	fetch = function(r, o) {
		if (!o) o = { cache: reload };
		else if (!o.cache) o.cache = 'reload';
		if (!component_registry["force:reload"]) { 
			component_registry["force:reload"]=ShowDiagnostic("Defaulting to reload from server when fetching page parts.\nYou may need to force reload the page itself too. CTRL+F5 may do it.");
		}
		ShowDiagnostic("with " + o.cache + ", fetch: " + r);
		return nativeFetch(r, o);
	}
	
})());