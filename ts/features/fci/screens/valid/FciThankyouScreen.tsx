import { FooterActions, Pictogram } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { View } from "react-native";
import { TypeEnum as ClauseTypeEnum } from "../../../../../definitions/fci/Clause";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { trackFciUxSuccess } from "../../analytics";
import { InfoScreenComponent } from "../../components/InfoScreenComponent";
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
    <View style={{ flex: 1 }} testID={"FciTypSuccessTestID"}>
      <InfoScreenComponent
        image={<Pictogram name={"success"} />}
        title={I18n.t("features.fci.thankYouPage.title")}
        body={I18n.t("features.fci.thankYouPage.content")}
      />
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            onPress: () => dispatch(fciEndRequest()),
            label: I18n.t("features.fci.thankYouPage.cta"),
            testID: "FciTypCloseButton"
          }
        }}
      />
    </View>
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
