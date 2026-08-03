import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as J from "fp-ts/lib/Json";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ReactElement, useEffect } from "react";

import { ProblemJson } from "../../../../definitions/fci/ProblemJson";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { withAppRequiredUpdate } from "../../../components/helpers/withAppRequiredUpdate";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  getErrorFromNetworkError,
  getGenericError,
  NetworkError
} from "../../../utils/errors";
import {
  trackFciSignatureDetailFailureAction,
  trackFciSignatureGenericFailure,
  trackFciSignatureMismatch
} from "../analytics";
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
  // Used on retry only on status != WAIT_FOR_SIGNATURE
  skipInitialFetch?: boolean;
}>;

const FciSignatureScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_ROUTER">
): ReactElement => {
  const { signatureRequestId, skipInitialFetch } = props.route.params;
  const dispatch = useIODispatch();
  const fciSignatureRequest = useIOSelector(fciSignatureRequestSelector);

  useEffect(() => {
    if (!skipInitialFetch) {
      dispatch(fciSignatureRequestFromId.request(signatureRequestId));
    }
  }, [dispatch, signatureRequestId, skipInitialFetch]);

  const LoadingView = () => (
    <LoadingComponent testID={"FciRouterLoadingScreenTestID"} />
  );

  const GenericError = (problemJson?: ProblemJson) => {
    const errorReason = problemJson ? problemJson.toString() : "unknown_error";
    if (problemJson?.status === 404) {
      trackFciSignatureMismatch();
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
    trackFciSignatureGenericFailure(errorReason);
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

export default withAppRequiredUpdate(FciSignatureScreen, "fci");
