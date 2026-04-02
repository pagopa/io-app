import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIOSelector } from "../../../../store/hooks";
import { profileSelector } from "../../../settings/common/store/selectors";
import { canAccessCgn } from "../utils/dates";

const useCgnEligibility = () => {
  const profile = pot.toUndefined(useIOSelector(profileSelector));

  return canAccessCgn(profile);
};

export default useCgnEligibility;
