import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as J from "fp-ts/lib/Json";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ReactElement, useEffect } from "react";

import { ProblemJson } from "../../../../definitions/fci/ProblemJson";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isFciEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { isTestEnv } from "../../../utils/environment";
import {
  getErrorFromNetworkError,
  getGenericError,
  NetworkError
} from "../../../utils/errors";
import { trackFciSignatureDetailFailureAction } from "../analytics";
import LoadingComponent from "../components/LoadingComponent";
import {
  default as ErrorComponent,
  default as SignatureStatusComponent
} from "../components/SignatureStatusComponent";
import SuccessComponent from "../components/SuccessComponent";
import { FciParamsList } from "../navigation/params";
import { fciEndRequest, fciSignatureRequestFromId } from "../store/actions";
import { fciSignatureRequestSelector } from "../store/reducers/fciSignatureRequest";

export type FciRouterScreenNavigationParams = Readonly<{
  signatureRequestId: SignatureRequestDetailView["id"];
}>;

const FciSignatureScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_ROUTER">
): ReactElement => {
  // TODO: add a check to validate signatureRequestId using io-ts
  // https://pagopa.atlassian.net/browse/SFEQS-1705?atlOrigin=eyJpIjoiOWY2NDA4YmQ0ZTQ0NGRjZTk5MGNlZDczZGIxMDllMmIiLCJwIjoiaiJ9
  const signatureRequestId = props.route.params.signatureRequestId;
  const dispatch = useIODispatch();
  const fciSignatureRequest = useIOSelector(fciSignatureRequestSelector);
  const fciEnabledSelector = useIOSelector(isFciEnabledSelector);
  const fciEnabled = isTestEnv || fciEnabledSelector;

  useEffect(() => {
    if (fciEnabled) {
      dispatch(fciSignatureRequestFromId.request(signatureRequestId));
    }
  }, [dispatch, signatureRequestId, fciEnabled]);

  if (!fciEnabled) {
    return (
      <SignatureStatusComponent
        onPress={() => dispatch(fciEndRequest())}
        pictogram={"umbrella"}
        subTitle={I18n.t("features.fci.errors.generic.update.subTitle")}
        testID="GenericErrorComponentTestID"
        title={I18n.t("features.fci.errors.generic.update.title")}
      />
    );
  }

  const LoadingView = () => (
    <LoadingComponent testID={"FciRouterLoadingScreenTestID"} />
  );

  const GenericError = (problemJson?: ProblemJson) => {
    const errorReason = problemJson ? problemJson.toString() : "unknown_error";
    if (problemJson?.status === 404) {
      return (
        <ErrorComponent
          onPress={() => dispatch(fciEndRequest())}
          pictogram="accessDenied"
          subTitle={I18n.t("features.fci.errors.generic.wrongUser.subTitle")}
          testID="WrongUserErrorComponentTestID"
          title={I18n.t("features.fci.errors.generic.wrongUser.title")}
        />
      );
    }
    return (
      <SignatureStatusComponent
        onPress={() => {
          trackFciSignatureDetailFailureAction(
            errorReason,
            "custom_1",
            I18n.t("features.fci.errors.buttons.close")
          );
          dispatch(fciEndRequest());
        }}
        onPressAssistance={() => {
          trackFciSignatureDetailFailureAction(
            errorReason,
            "custom_2",
            I18n.t("features.fci.errors.buttons.assistance")
          );
        }}
        pictogram={"umbrella"}
        subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
        testID="GenericErrorComponentTestID"
        title={I18n.t("features.fci.errors.generic.default.title")}
      />
    );
  };

  // given an error should parse it and return a SignatureStatusComponent
  const renderErrorComponent = (error?: NetworkError) =>
    pipe(
      error,
      O.fromNullable,
      O.map(e => getErrorFromNetworkError(e)),
      O.map(err => getGenericError(err)),
      O.chain(err => pipe(err.value.message, J.parse, O.fromEither)),
      O.map(ProblemJson.decode),
      O.map(
        E.fold(
          () => GenericError(),
          problemJson => GenericError(problemJson)
        )
      ),
      O.getOrElse(() => GenericError())
    );

  return pot.fold(
    fciSignatureRequest,
    () => <LoadingView />,
    () => <LoadingView />,
    () => <LoadingView />,
    renderErrorComponent,
    b => <SuccessComponent signatureRequest={b} />,
    () => <LoadingView />,
    () => <LoadingView />,
    () => renderErrorComponent()
  );
};

export default FciSignatureScreen;
