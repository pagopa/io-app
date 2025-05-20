import { useEffect, useMemo } from "react";
import { Credential } from "@pagopa/io-react-native-wallet";
import { constNull } from "fp-ts/lib/function";
import { AuthErrorResponseBody } from "../utils/itwRemoteTypeUtils";
import { RemoteFailure, RemoteFailureType } from "../machine/failure";
import { selectUnverifiedRequestObject } from "../machine/selectors";
import { ItwRemoteMachineContext } from "../machine/provider";
import { OperationResultScreenContentProps } from "../../../../../components/screens/OperationResultScreenContent";

type Props = {
  failure: RemoteFailure;
  resultScreenProps: OperationResultScreenContentProps;
};

export const useSendAuthorizationResponse = ({
  failure,
  resultScreenProps
}: Props) => {
  const unverifiedRequestObject = ItwRemoteMachineContext.useSelector(
    selectUnverifiedRequestObject
  );
  const { subtitle } = resultScreenProps;
  const errorDescription =
    typeof subtitle === "string" ? subtitle : failure.type;

  const authErrorBody = useMemo<AuthErrorResponseBody>(() => {
    if (failure.type === RemoteFailureType.INVALID_REQUEST_OBJECT) {
      return {
        error: "invalid_request_object",
        errorDescription
      };
    }
    return {
      error: "access_denied",
      errorDescription
    };
  }, [failure.type, errorDescription]);

  useEffect(() => {
    if (unverifiedRequestObject) {
      void Credential.Presentation.sendAuthorizationErrorResponse(
        unverifiedRequestObject,
        authErrorBody
      ).catch(constNull); // Catching errors to ensure the app doesn't crash if sending the authorization error response fails.
    }
  }, [authErrorBody, unverifiedRequestObject]);
};
