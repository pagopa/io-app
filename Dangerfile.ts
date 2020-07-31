// Import custom DangerJS rules.
// See http://danger.systems/js
// See https://github.com/teamdigitale/danger-plugin-digitalcitizenship/
import checkDangers from "danger-plugin-digitalcitizenship";

import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
declare var danger: DangerDSLType;

checkDangers();

danger.github.api.pulls
  .update({
    ...danger.github.thisPR,
    title: "danger test!"
  })
  .then(res => console.log(res))
  .catch(ex => console.log(ex));
