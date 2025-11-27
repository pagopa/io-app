import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { TypeEnum as ClauseTypeEnum } from "../../../../../definitions/fci/Clause";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { trackFciUxSuccess } from "../../analytics";
import LoadingComponent from "../../components/LoadingComponent";
import SignatureStatusComponent from "../../components/SignatureStatusComponent";
import { fciEndRequest, fciStartRequest } from "../../store/actions";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import { fciSignatureSelector } from "../../store/reducers/fciSignature";
import { getClausesCountByTypes } from "../../utils/signatureFields";

const FciThankyouScreen = () => {
  const fciCreateSignatureSelector = useIOSelector(fciSignatureSelector);
  const documentSignatures = useIOSelector(fciDocumentSignaturesSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const dispatch = useIODispatch();

  const LoadingView = () => (
    <LoadingComponent testID={"FciTypLoadingScreenTestID"} />
  );

  const ErrorComponent = () => (
    <SignatureStatusComponent
      title={I18n.t("features.fci.errors.generic.signing.title")}
      subTitle={I18n.t("features.fci.errors.generic.signing.subTitle")}
      onPress={() => dispatch(fciStartRequest())}
      pictogram={"umbrella"}
      retry={true}
      assistance={true}
      testID="FciTypErrorScreenTestID"
    />
  );

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
    _ => <ErrorComponent />,
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
    _ => <ErrorComponent />
  );
};

export default FciThankyouScreen;
