const public_root = 'https://drive.google.com/drive/folders/18P2j2OR78lDrOk2o_YSzrWcknkRbu-0A?usp=drive_link';
const web_service = 'https://helloworld-s7fgrxt6mq-ew.a.run.app';
const github_user = 'solsnicethings';
const github_repo = github_user + '.github.io';

const component_registry = {};
const urlSearchParams = new URLSearchParams(location.search);

var tech_trigger = 'allow';

function ShouldProceedWithBug() {
	// creates/shows the bug explainer tool if needed
	// returns true if the bug should happen
	return false;
}

function DisallowTechSelfExecute() { tech_trigger = 'forbid'; }
function HaltTechSelfExecute() { tech_trigger = 'delay'; }
function CompleteTechSelfExecute(fail) { if (fail)tech_trigger.rejectIt(); else tech_trigger.resolveIt(); }

async function TechObserveTriggerRule() {
	switch (tech_trigger) {
		case 'allow': return true;
		case 'forbid': return false;
		case 'delay':
		tech_trigger = PromiseAnything();
	}
	await tech_trigger.chainThen( () => { tech_trigger = 'allow'; }, () => { tech_trigger = 'forbid'; } );
	return tech_trigger == 'allow';
}