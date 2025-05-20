import { useEffect, useMemo } from "react";
import { Credential } from "@pagopa/io-react-native-wallet";
import { constNull } from "fp-ts/lib/function";
import { Nullable } from "@pagopa/io-app-design-system";
import { AuthErrorResponseBody } from "../utils/itwRemoteTypeUtils";
import { RemoteFailure, RemoteFailureType } from "../machine/failure";
import { selectUnverifiedRequestObject } from "../machine/selectors";
import { ItwRemoteMachineContext } from "../machine/provider";
import { OperationResultScreenContentProps } from "../../../../../components/screens/OperationResultScreenContent";

type Props = {
  failure: RemoteFailure;
  resultScreenProps: OperationResultScreenContentProps;
};

export const useItwSendAuthorizationErrorResponse = ({
  failure,
  resultScreenProps
}: Props) => {
  const unverifiedRequestObject = ItwRemoteMachineContext.useSelector(
    selectUnverifiedRequestObject
  );
  const { subtitle } = resultScreenProps;
  const errorDescription =
    typeof subtitle === "string" ? subtitle : failure.type;

  const authErrorBody = useMemo<Nullable<AuthErrorResponseBody>>(() => {
    if (failure.type === RemoteFailureType.INVALID_REQUEST_OBJECT) {
      return {
        error: "invalid_request_object",
        errorDescription
      };
    }
    // Errors related to the `AuthorizationResponse` are not taken into account,
    // as it's assumed that the RP is already aware of the error.
    // https://github.com/pagopa/io-app/pull/6963#pullrequestreview-2853984677
    if (
      failure.type !== RemoteFailureType.RELYING_PARTY_GENERIC &&
      failure.type !== RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE
    ) {
      return {
        error: "access_denied",
        errorDescription
      };
    }

    return null;
  }, [failure.type, errorDescription]);

  useEffect(() => {
    if (unverifiedRequestObject && authErrorBody) {
      void Credential.Presentation.sendAuthorizationErrorResponse(
        unverifiedRequestObject,
        authErrorBody
      ).catch(constNull); // Catching errors to ensure the app doesn't crash if sending the authorization error response fails.
    }
  }, [authErrorBody, unverifiedRequestObject]);
};
