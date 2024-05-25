async function FetchFileList(path, exceptionHandler, fileType = 'file') {
	
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
		if (file.type == fileType || !fileType) {
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
function AddDocument(srchref, containWidth = false, target = null, allowRelocateToHead = false) {
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
				if (allowRelocateToHead) target = document.head;
				break;
				
				case '.jpg': case '.svg': case '.png': case '.bmp':
				case '.jpeg': case '.gif':
				x = document.createElement('img');
				x.setAttribute('src', srchref);
				break;
				
				default: x = null; break;
			}
		if (!x) {
			if (target == document.head) return undefined;
			if (target === null) target = document.body;
			x = document.createElement('iframe');
			x.setAttribute('src', srchref);
		}
		component_registry[srchref] = x;
	}
	if (target === null) target = document.head;
	if (containWidth && target != document.head)
	{
		containWidth = x.parentNode;
		if (containWidth && containWidth.firstElementChild == x && containWidth.classList.contains('fixwidth')) {
			if (containWidth.parentNode == target) return x;
			if (x == containWidth.firstChild && x == containWidth.lastChild)
			{
				target.appendChild(containWidth);
				return x;
			}
		}
		containWidth = document.createElement('div');
		containWidth.className = 'fixwidth';
		containWidth.appendChild(x);
		target.appendChild(containWidth);
		return x;
	}
	if (target != x.parentNode) target.appendChild(x);
	return x;
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
	let p = {
		resolveIt: resolve,
		rejectIt: reject,
		
		chainThen: (f,r) => { return promise = promise.then(f,r); },
		chainCatch: f => { return promise = promise.catch(f); }		
	};
	p.chainThen( r => { p.result = r; });
	return p;
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
			if ( parent ) {
				InformParent( { height: getComputedStyle(document.documentElement).height });
				let o = new ResizeObserver(entries => {
					InformParent( { height: getComputedStyle(document.documentElement).height });
				});
				o.observe(document.documentElement, { box: "border-box" });
			}
		}
	});
});

let post_listeners;

function ListenForPostMessage(source, callback, origin) {
	
	let start_listener ;
	if (post_listeners) start_listener = false; else { start_listener = true; post_listeners = {}; }
		
	if (source instanceof HTMLIFrameElement) {
		if (!origin) {
			origin = source.getAttribute('src');
			if (origin) {
				origin = new URL(origin, location.origin);
				origin = origin.origin;
			}
		}
		if (source.contentWindow) source = source.contentWindow;
		else 
		{
			let late_bind = post_listeners[''];
			if (!late_bind) { late_bind = []; post_listeners['']=late_bind; }
			late_bind.push(source);
		}
	}
	if (!origin) origin = location.origin;
	
	{
		let bundle = post_listeners[source];
		if (!bundle) { bundle = {}; post_listeners[source] = bundle; }
		
		let list = bundle[origin];
		if (!list) { list = []; bundle[origin] = list; }
		
		list.push(callback);
	}
	
	if (start_listener) {
		window.addEventListener(   "message",   (event) => {
			let call = post_listeners[''];
			if (call) {
				post_listeners[''] = null;
				for (const latesource of call) {
					const w = latesource.contentWindow;
					if (!w){ if (!post_listeners['']) post_listeners[''] = []; post_listeners[''].push(latesource); continue; }
					
					const b = post_listeners[latesource];
					for (const lateorigin in b)
						for (const latecallback of b[lateorigin])
							ListenForPostMessage(w, latecallback, lateorigin);
				}
			}
			
			call = post_listeners[event.source];
			if (!call) return;
			let calls = call[event.origin];
			if (calls) for (const c of calls) c(event);
			calls = call['*'];
			if (calls) for (const c of calls) c(event);
		});
	}
}

const parentQueries = {};

function StartConversation() {
	let qid;
	do qid= Date.now(); while (parentQueries[qid] || qid == 0);
	parentQueries[qid] = true;
	return qid;
}
function EndConversation(conversationId) { delete parentQueries[conversationId]; }

async function AskParent(query, conversationId, deleteOnAnswer, parentWindow = parent, origin = location.origin) {
	
	if (!conversationId) { deleteOnAnswer = true; conversationId = startConversation(); }
	
	let resolve = PromiseAnything();
	
	const getReply = function(event) {
		if (!(event.source == parentWindow && event.origin == origin)) return;
		event = event.data;
		if (!(event.isAnswer && event.id == conversationId)) return;
		window.removeEventListener('message', getReply);
		if (deleteOnAnswer) EndConversation(conversationId);
		resolve.resolveIt(event.answerIs);
	};
	
	window.addEventListener('message', getReply);
	parentWindow.postMessage({ q: query, id: conversationId}, origin);
	await resolve.chainThen();
	return resolve.result;
}
 function InformParent(query, parentWindow = parent, origin = location.origin) {
	 	parentWindow.postMessage({ q: query, id: 0 }, origin);
 }

 const conversation_helper = {};
 
function AsAnsweringMachine(functionThatReceivesDataFromApostMessageEventAndRespondsUsingTheSecondParameterAndReturnsAnythingToRememberWhichIsThenTheThirdParameter) {
	return (event) => {
		const q = event.data.q;
		if (!q) return;
		const id = event.data.id;
		if (id) {
			let helper = conversation_helper[id];
			let sourcemem, remember;
			if (helper) sourcemem = helper[event.source]; else sourcemem = undefined;
			if (sourcemem) remember = sourcemem.remember; else remember = undefined;
			
			let doPost = null;
			remember = functionThatReceivesDataFromApostMessageEventAndRespondsUsingTheSecondParameterAndReturnsAnythingToRememberWhichIsThenTheThirdParameter(event.data.q, a => {
				if (doPost) event.source.postMessage({ id: id, isAnswer: true, answerIs: a }, event.origin);
				else doPost = () => event.source.postMessage({ id: id, isAnswer: true, answerIs: a }, event.origin);
			}, remember);
			
			const cleanup = (result) => {
				if (result === undefined)
				{
					if (sourcemem)
						if (helper.count == 1) delete conversation_helper[id];
						else {
							delete helper.sources[event.source];
							helper.count--;
						}
				}
				else if (sourcemem) sourcemem.remember = result;
				else if (helper) {
					helper.count++;
					helper.sources[event.source] = { remember: result };
				}
				else {
					helper = { count: 1 };
					helper[event.source] = { remember: result };
					conversation_helper[id] = helper;
				}
				if (doPost) doPost(); else doPost = true;
			};
			
			if (remember instanceof Promise) remember.then(cleanup); else cleanup(remember);
		}
		else functionThatReceivesDataFromApostMessageEventAndRespondsUsingTheSecondParameterAndReturnsAnythingToRememberWhichIsThenTheThirdParameter(event.data.q);
	};
}

async function PerformAsFetchProxyAnsweringMachine(data, connection, recollection) {
	switch (data.please) {
		case 'fetch':
			recollection = await fetch(data.path, data.options);
			connection({
				//headers: recollection.headers,
				ok: recollection.ok,
				redirected: recollection.redirected,
				status: recollection.status,
				statusText: recollection.statusText,
				type: recollection.type,
				url: recollection.url
			});
			return recollection;
		case 'fetch.text':
			connection(await recollection.text());
			return;
		case 'fetch.json':
			connection(await recollection.json());
			return;
	}
}

((() => {
	if (urlSearchParams.has('embedded')) {
		fetch = /* (askfor, askoptn) => {
			return AskParent({ please: 'fetch', path: askfor, options: askoptn });
		};*/ async function (askfor, askoptn) {
			const qid = StartConversation();
			let result = await AskParent({ please: 'fetch', path: askfor, options: askoptn }, qid);
			result.json = () => { return AskParent({ please: 'fetch.json' }, qid, true); };
			result.text  = () => { return AskParent({ please: 'fetch.text' }, qid, true); };
			return result;
		};
	}
	
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