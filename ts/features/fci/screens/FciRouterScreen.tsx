import * as React from "react";
import { constNull, pipe } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../i18n";
import doubt from "../../../../img/pictograms/doubt.png";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { FciParamsList } from "../navigation/params";
import { fciEndRequest, fciSignatureRequestFromId } from "../store/actions";
import { fciSignatureRequestSelector } from "../store/reducers/fciSignatureRequest";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import SuccessComponent from "../components/SuccessComponent";
import GenericErrorComponent from "../components/GenericErrorComponent";
import { withValidatedEmail } from "../../../components/helpers/withValidatedEmail";
import {
  NetworkError,
  getErrorFromNetworkError,
  getGenericError
} from "../../../utils/errors";
import { ProblemJson } from "../../../../definitions/fci/ProblemJson";
import ErrorComponent from "../components/ErrorComponent";

export type FciRouterScreenNavigationParams = Readonly<{
  signatureRequestId: SignatureRequestDetailView["id"];
}>;

const FciSignatureScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_ROUTER">
): React.ReactElement => {
  const signatureRequestId = props.route.params.signatureRequestId;
  const dispatch = useIODispatch();
  const fciSignatureRequest = useIOSelector(fciSignatureRequestSelector);

  React.useEffect(() => {
    dispatch(fciSignatureRequestFromId.request(signatureRequestId));
  }, [dispatch, signatureRequestId]);

  const LoadingComponent = () => (
    <LoadingErrorComponent
      isLoading={true}
      loadingCaption={""}
      onRetry={constNull}
      testID={"FciRouterLoadingScreenTestID"}
    />
  );

  const GenericError = (status?: ProblemJson["status"]) => {
    if (status === 404) {
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.generic.wrongUser.title")}
          subTitle={I18n.t("features.fci.errors.generic.wrongUser.subTitle")}
          image={doubt}
          onPress={() => dispatch(fciEndRequest())}
          testID="WrongUserErrorComponentTestID"
        />
      );
    }

    return (
      <GenericErrorComponent
        title={I18n.t("features.fci.errors.generic.default.title")}
        subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        testID="GenericErrorComponentTestID"
      />
    );
  };

  const renderErrorComponent = (error?: NetworkError) =>
    pipe(
      error,
      O.fromNullable,
      O.map(e => getErrorFromNetworkError(e)),
      O.map(error => getGenericError(error)),
      O.map(error => JSON.parse(error.value.message)),
      O.map(ProblemJson.decode),
      O.map(
        E.fold(
          () => GenericError(),
          problemJson => GenericError(problemJson.status)
        )
      ),
      O.getOrElse(() => GenericError())
    );

  return pot.fold(
    fciSignatureRequest,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    renderErrorComponent,
    b => <SuccessComponent signatureRequest={b} />,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    () => renderErrorComponent()
  );
};

export default withValidatedEmail(FciSignatureScreen);
