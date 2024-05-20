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
		promise: promise,
		resolveIt: resolve,
		rejectIt: reject
	};
}

function RunWhenDomReady(e) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", e);
	} else {
		e();
	}
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
	CompleteComposeScript.promise.then(()=>{
		let e = document.createElement('a');
		e.className = 'helplink';
		e.setAttribute("href", "?reload");
		e.innerText = 'Reload page components';
		e.style['float'] = 'right';
		document.body.insertBefore(e, document.body.firstElementChild);
		e = document.querySelector('body > footer:last-of-type');
		if (e) e.insertBefore(purgenotifs, e.firstElementChild);
	});
});

((() => {
	{let params = new URLSearchParams(location.search);
	if (!params.has('reload')) return;}
	
	{
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
	}	
})());