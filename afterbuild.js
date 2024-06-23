const { argv } = require('node:process');
const path = require('path');
const fs = require('fs');

const scriptfile = argv[1];
const root = path.dirname(scriptfile);
const indexroot = path.join(root, 'sitemap');

function mkdir(path, options = { recursive: true }) {
	if (!fs.statSync(path, {throwIfNoEntry: false})?.isDirectory()) fs.mkdirSync(path, options);
}

const filesToMake {};

function makesitemap(srcpath = root, bldpath = indexroot, exclusions = [ path.basename(scriptfile) ]) {
	mkdir(bldpath);
	const index = [];
	for (const e of fs.readdirSync(srcpath)) {
		if (exclusions && exclusions.indexOf(e) >= 0) continue;
		if (fs.statSync(path.join(srcpath, e)).isDirectory()) {
			index.push({ Directory: e });
			makesitemap(path.join(srcpath, e), path.join(bldpath, e), null, e);
		}
		else index.push(e);
	}
	filesToMake[bldPath] = index;
}

makesitemap();

for (const f in filesToMake) {
	mkdir(f);
	fs.writeFileSync(path.join(f, '_.json'), JSON.stringify(index));
}