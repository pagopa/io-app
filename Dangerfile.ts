// Import custom DangerJS rules.
// See http://danger.systems/js
// See https://github.com/teamdigitale/danger-plugin-digitalcitizenship/
import checkDangers from "danger-plugin-digitalcitizenship";

import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
declare var danger: DangerDSLType;

checkDangers();

console.log("thisPR: " + danger.github.thisPR);

danger.github.api.pulls
  .update({
    owner: danger.github.thisPR.owner,
    repo: danger.github.thisPR.repo,
    pull_number: danger.github.thisPR.number,
    title: "danger test!"
  })
  .then(res => console.log("complete " + res))
  .catch(ex => console.log("except: " + ex));
