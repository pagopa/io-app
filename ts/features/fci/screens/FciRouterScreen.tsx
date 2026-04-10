import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as J from "fp-ts/lib/Json";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ReactElement, useEffect } from "react";
import { ProblemJson } from "../../../../definitions/fci/ProblemJson";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isFciEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { isTestEnv } from "../../../utils/environment";
import {
  NetworkError,
  getErrorFromNetworkError,
  getGenericError
} from "../../../utils/errors";
import LoadingComponent from "../components/LoadingComponent";
import {
  default as ErrorComponent,
  default as SignatureStatusComponent
} from "../components/SignatureStatusComponent";
import SuccessComponent from "../components/SuccessComponent";
import { FciParamsList } from "../navigation/params";
import { FCI_ROUTES } from "../navigation/routes";
import { fciEndRequest, fciSignatureRequestFromId } from "../store/actions";
import { fciSignatureRequestSelector } from "../store/reducers/fciSignatureRequest";
import {
  trackFciSignatureDetailFailureAction,
  trackFciSignatureGenericFailure,
  trackFciSignatureMismatch
} from "../analytics";
import { spidLevelShortSelector } from "../../authentication/common/store/selectors";
import { useIsNfcFeatureAvailable } from "../../pn/aar/hooks/useIsNfcFeatureAvailable";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import {
  setStartActiveSessionLogin,
  setIdpSelectedActiveSessionLogin,
  setActiveSessionLoginFlow
} from "../../authentication/activeSessionLogin/store/actions";
import { SETTINGS_ROUTES } from "../../settings/common/navigation/routes";
import { AUTHENTICATION_ROUTES } from "../../authentication/common/navigation/routes";
import { IdpCIE } from "../../authentication/login/hooks/useNavigateToLoginMethod";
import { Identifier } from "../../authentication/login/optIn/screens/OptInScreen";

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
  const spidLevelSelector = useIOSelector(spidLevelShortSelector);
  const isCieSupported = useIsNfcFeatureAvailable();
  const navigation = useIONavigation();

  const isL3User = spidLevelSelector === "L3";
  const requiresCieAuth = !isL3User && isCieSupported === true;

  // Effect only for API call dispatch - no navigation logic here
  useEffect(() => {
    if (fciEnabled && isL3User) {
      dispatch(fciSignatureRequestFromId.request(signatureRequestId));
    }
  }, [dispatch, signatureRequestId, fciEnabled, isL3User]);

  // Guard: FCI feature disabled
  if (!fciEnabled) {
    return (
      <SignatureStatusComponent
        title={I18n.t("features.fci.errors.generic.update.title")}
        subTitle={I18n.t("features.fci.errors.generic.update.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        pictogram={"umbrella"}
        testID="GenericErrorComponentTestID"
      />
    );
  }

  // Guard: Non-L3 user - checking NFC availability
  if (!isL3User && isCieSupported === undefined) {
    return <LoadingComponent testID={"FciNfcCheckLoadingTestID"} />;
  }

  // Guard: Non-L3 user - NFC not available
  if (!isL3User && isCieSupported === false) {
    return (
      <SignatureStatusComponent
        title={I18n.t("features.fci.requestL3.nfcError.title")}
        subTitle={I18n.t("features.fci.requestL3.nfcError.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        pictogram={"nfcScanAndroid"}
        testID="NfcNotAvailableErrorComponentTestID"
      />
    );
  }

  // Guard: Non-L3 user - NFC available, needs CIE authentication
  if (requiresCieAuth) {
    // TODO: Navigate to CIE authentication screen or show appropriate flow
    // For now, show a placeholder screen
    return (
      <OperationResultScreenContent
        title={I18n.t("features.fci.requestL3.title")}
        subtitle={I18n.t("features.fci.requestL3.subtitle")}
        action={{
          label: I18n.t("features.fci.requestL3.action"),
          onPress: () => {
            dispatch(setStartActiveSessionLogin());
            dispatch(setIdpSelectedActiveSessionLogin(IdpCIE));
            dispatch(
              setActiveSessionLoginFlow({
                type: "FCI",
                route:
                  (FCI_ROUTES.MAIN,
                  {
                    screen: FCI_ROUTES.ROUTER,
                    params: { signatureRequestId }
                  })
              })
            );
            navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
              screen: SETTINGS_ROUTES.AUTHENTICATION,
              params: {
                screen: AUTHENTICATION_ROUTES.OPT_IN,
                params: { identifier: Identifier.CIE }
              }
            });
          }
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: () => {
            dispatch(fciEndRequest());
          }
        }}
        pictogram={"identityCheck"}
      />
    );
  }

  const LoadingView = () => (
    <LoadingComponent testID={"FciRouterLoadingScreenTestID"} />
  );

  const GenericError = (problemJson?: ProblemJson) => {
    const errorReason = problemJson ? problemJson.toString() : "unknown_error";
    if (problemJson?.status === 404) {
      trackFciSignatureMismatch();
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.generic.wrongUser.title")}
          subTitle={I18n.t("features.fci.errors.generic.wrongUser.subTitle")}
          pictogram="accessDenied"
          onPress={() => dispatch(fciEndRequest())}
          testID="WrongUserErrorComponentTestID"
        />
      );
    }
    trackFciSignatureGenericFailure(errorReason);
    return (
      <SignatureStatusComponent
        title={I18n.t("features.fci.errors.generic.default.title")}
        subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
        onPress={() => {
          trackFciSignatureDetailFailureAction(
            errorReason,
            "custom_1",
            I18n.t("features.fci.errors.buttons.close")
          );
          dispatch(fciEndRequest());
        }}
        pictogram={"umbrella"}
        testID="GenericErrorComponentTestID"
        onPressAssistance={() => {
          trackFciSignatureDetailFailureAction(
            errorReason,
            "custom_2",
            I18n.t("features.fci.errors.buttons.assistance")
          );
        }}
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
