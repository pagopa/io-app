import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { UserOnboardingStatusDTO } from "../../../../generated/definitions/idpay/UserOnboardingStatusDTO";
import { onboardedInitiativeStatuses } from "../../../persistence/idpay";

export const getOnboardingInitiativeUserStatus = (): O.Option<
  Array<UserOnboardingStatusDTO>
> =>
  pipe(
    onboardedInitiativeStatuses,
    O.fromNullable,
    O.map(el => el)
  );
