const public_root = 'https://drive.google.com/drive/folders/18P2j2OR78lDrOk2o_YSzrWcknkRbu-0A?usp=drive_link';
const web_service = 'https://helloworld-s7fgrxt6mq-ew.a.run.app';
const github_user = 'solsnicethings';
const github_repo = github_user + '.github.io';

async function FileListCallback(path, responseHandler, exceptionHandler) {
	
	const response = await fetch('https://api.github.com/repos/' + github_user + '/' + github_repo + '/contents/' + path, { credentials: "omit" });
	
	if (!response.ok) {
			if (exceptionHandler) exceptionHandler(response);
			return;
	}
	
	const data = await response.json();	
	let filelist = [];
	
	for (const file of data) {
		if (file.type
	}
}