import { Errors } from "@pagopa/io-react-native-wallet";
import { pipe } from "fp-ts/lib/function";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { IssuerConfiguration } from "../../common/utils/itwTypesUtils";
import { StatusAttestationError } from "../../common/utils/itwCredentialStatusAttestationUtils";
import { getClaimsFullLocale } from "../../common/utils/itwClaimsUtils";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType
} from "../../machine/credential/failure";

type Params = {
  credentialType: O.Option<string>;
  issuerConf: O.Option<IssuerConfiguration>;
};

/**
 * Hook used to safely extract details from an invalid status failure, including the localized message.
 *
 * **Note:** The message is dynamic and must be extracted from the EC.
 */
export const useCredentialInvalidStatusDetails = (
  failure: CredentialIssuanceFailure,
  { credentialType, issuerConf }: Params
) => {
  const errorCodeOption = pipe(
    failure,
    O.fromPredicate(
      x => x.type === CredentialIssuanceFailureType.INVALID_STATUS
    ),
    O.chainEitherK(x => StatusAttestationError.decode(x.reason.reason)),
    O.map(x => x.error)
  );

  const localizedMessage = pipe(
    sequenceS(O.Monad)({
      errorCode: errorCodeOption,
      credentialType,
      issuerConf
    }),
    O.map(({ errorCode, ...rest }) =>
      Errors.extractErrorMessageFromIssuerConf(errorCode, rest)
    ),
    O.map(message => message?.[getClaimsFullLocale()]),
    O.toUndefined
  );

  return {
    message: localizedMessage,
    errorCode: pipe(errorCodeOption, O.toUndefined)
  };
};
