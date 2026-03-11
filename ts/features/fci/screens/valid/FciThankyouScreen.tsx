import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { TypeEnum as ClauseTypeEnum } from "../../../../../definitions/fci/Clause";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  trackFciDocSignatureFailure,
  trackFciDocSignatureFailureAction,
  trackFciUxSuccess
} from "../../analytics";
import LoadingComponent from "../../components/LoadingComponent";
import SignatureStatusComponent from "../../components/SignatureStatusComponent";
import {
  fciEndRequest,
  fciSignatureRequestRetryFromId
} from "../../store/actions";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import { fciSignatureSelector } from "../../store/reducers/fciSignature";
import { getClausesCountByTypes } from "../../utils/signatureFields";
import { fciSignatureRequestIdSelector } from "../../store/reducers/fciSignatureRequest";
import { getNetworkErrorMessage, NetworkError } from "../../../../utils/errors";

const FciThankyouScreen = () => {
  const fciCreateSignatureSelector = useIOSelector(fciSignatureSelector);
  const documentSignatures = useIOSelector(fciDocumentSignaturesSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const dispatch = useIODispatch();
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);

  const LoadingView = () => (
    <LoadingComponent testID={"FciTypLoadingScreenTestID"} />
  );

  const ErrorComponent = ({ error }: { error: NetworkError | Error }) => {
    // eslint-disable-next-line functional/no-let
    let errorMessage: string;
    if ("kind" in error) {
      errorMessage = getNetworkErrorMessage(error);
    } else {
      errorMessage = error.message;
    }
    // check with Alessia are tracked FCI_DOC_SIGNATURE_FAILURE and FCI_SIGNING_FAILURE
    // check with Alessia FCI_DOC_SIGNATURE_FAILURE_ACTION
    trackFciDocSignatureFailure(errorMessage);
    return (
      <SignatureStatusComponent
        title={I18n.t("features.fci.errors.generic.signing.title")}
        subTitle={I18n.t("features.fci.errors.generic.signing.subTitle")}
        onPress={() => {
          trackFciDocSignatureFailureAction(
            errorMessage,
            "custom_1",
            I18n.t("features.fci.errors.buttons.retry")
          );
          if (signatureRequestId) {
            dispatch(fciSignatureRequestRetryFromId(signatureRequestId));
          }
        }}
        pictogram={"umbrella"}
        retry={true}
        assistance={true}
        testID="FciTypErrorScreenTestID"
        onPressAssistance={() => {
          trackFciDocSignatureFailureAction(
            errorMessage,
            "custom_2",
            I18n.t("features.fci.errors.buttons.assistance")
          );
        }}
      />
    );
  };

  const SuccessComponent = () => (
    <OperationResultScreenContent
      isHeaderVisible={false}
      title={I18n.t("features.fci.thankYouPage.title")}
      subtitle={I18n.t("features.fci.thankYouPage.content")}
      pictogram={"success"}
      testID={"FciTypSuccessTestID"}
      action={{
        onPress: () => dispatch(fciEndRequest()),
        label: I18n.t("features.fci.thankYouPage.cta"),
        testID: "FciTypCloseButton"
      }}
    />
  );

  return pot.fold(
    fciCreateSignatureSelector,
    () => <LoadingView />,
    () => <LoadingView />,
    () => <LoadingView />,
    error => <ErrorComponent error={error} />,
    _ => {
      trackFciUxSuccess(
        documentSignatures.length,
        getClausesCountByTypes(documentSignatures, [
          ClauseTypeEnum.REQUIRED,
          ClauseTypeEnum.UNFAIR
        ]),
        getClausesCountByTypes(documentSignatures, [ClauseTypeEnum.OPTIONAL]),
        fciEnvironment
      );
      return <SuccessComponent />;
    },
    () => <LoadingView />,
    () => <LoadingView />,
    (_, error) => <ErrorComponent error={error} />
  );
};

export default FciThankyouScreen;
