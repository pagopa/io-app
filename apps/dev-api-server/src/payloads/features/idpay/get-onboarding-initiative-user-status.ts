import { UserOnboardingStatusDTO } from "@io-app/api-types/generated/definitions/idpay/UserOnboardingStatusDTO";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { onboardedInitiativeStatuses } from "../../../persistence/idpay";

export const getOnboardingInitiativeUserStatus = (): O.Option<
  Array<UserOnboardingStatusDTO>
> =>
  pipe(
    onboardedInitiativeStatuses,
    O.fromNullable,
    O.map(el => el)
  );
