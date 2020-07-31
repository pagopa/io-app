// Import custom DangerJS rules.
// See http://danger.systems/js
// See https://github.com/teamdigitale/danger-plugin-digitalcitizenship/
import checkDangers from "danger-plugin-digitalcitizenship";

import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
declare var danger: DangerDSLType;

checkDangers();

danger.github.api.pullRequests.update({
  ...danger.github.thisPR,
  title: "danger test!"
});
