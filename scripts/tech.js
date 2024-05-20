async function FetchFileList(path, exceptionHandler) {
	
	const response = await fetch('https://api.github.com/repos/' + github_user + '/' + github_repo + '/contents/' + path, { credentials: "omit" });
	
	if (!response.ok) {
			if (exceptionHandler) exceptionHandler(response);
			else {
				exceptionHandler = ShowError(response.status);
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

function ShowError(message) {
	let e = document.createElement('errormsg');
	e.innerText = message;
	return document.body.insertBefore(e, document.querySelector('body > footer:last-of-type'));
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
	CompleteComposeScript.promise.then(()=>{
		let e = document.createElement('a');
		e.className = 'helplink';
		e.setAttribute("href", "?reload");
		e.innerText = 'Reload scripts and components';
		e.style['float'] = 'right';
		document.body.insertBefore(e, document.body.firstElementChild);
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
			return nativeFetch(r, o);
		}
	}	
})());