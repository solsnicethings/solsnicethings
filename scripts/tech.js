async function FetchFileList(path, exceptionHandler) {
	
	const response = await fetch('https://api.github.com/repos/' + github_user + '/' + github_repo + '/contents/' + path, { credentials: "omit" });
	
	if (!response.ok) {
			if (exceptionHandler) exceptionHandler(response);
			return;
	}
	
	const data = await response.json();	
	let filelist = [];
	
	for (const file of data) {
		if (file.type == 'file') filelist.push(file.path); 
	}
	
	return filelist;
}

function PromiseEvent(target, event) {
  return new Promise((resolve) => {
    const listener = () => {
      target.removeEventListener(event, listener);
      resolve();
    }
    target.addEventListener(event, listener);
  })
}

function RunWhenDomReady(e) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", e);
	} else {
		e();
	}
}

