import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  ButtonSolidProps,
  FooterWithButtons,
  IOStyles,
  Pictogram
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fciSignatureSelector } from "../../store/reducers/fciSignature";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import I18n from "../../../../i18n";
import { fciEndRequest, fciStartRequest } from "../../store/actions";
import { trackFciUxSuccess } from "../../analytics";
import { TypeEnum as ClauseTypeEnum } from "../../../../../definitions/fci/Clause";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import { getClausesCountByTypes } from "../../utils/signatureFields";
import LoadingComponent from "../../components/LoadingComponent";
import { InfoScreenComponent } from "../../components/InfoScreenComponent";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";

const FciThankyouScreen = () => {
  const fciCreateSignatureSelector = useIOSelector(fciSignatureSelector);
  const documentSignatures = useIOSelector(fciDocumentSignaturesSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const dispatch = useIODispatch();

  const LoadingView = () => (
    <LoadingComponent testID={"FciTypLoadingScreenTestID"} />
  );

  const ErrorComponent = () => (
    <GenericErrorComponent
      title={I18n.t("features.fci.errors.generic.signing.title")}
      subTitle={I18n.t("features.fci.errors.generic.signing.subTitle")}
      onPress={() => dispatch(fciStartRequest())}
      retry={true}
      assistance={true}
      testID="FciTypErrorScreenTestID"
    />
  );

  const SuccessComponent = () => {
    const continueButtonProps: ButtonSolidProps = {
      onPress: () => dispatch(fciEndRequest()),
      label: I18n.t("features.fci.thankYouPage.cta"),
      accessibilityLabel: I18n.t("features.fci.thankYouPage.cta"),
      testID: "FciTypCloseButton"
    };
    return (
      <View style={IOStyles.flex} testID={"FciTypSuccessTestID"}>
        <InfoScreenComponent
          image={<Pictogram name={"success"} />}
          title={I18n.t("features.fci.thankYouPage.title")}
          body={I18n.t("features.fci.thankYouPage.content")}
        />
        <FooterWithButtons
          type={"SingleButton"}
          primary={{ type: "Solid", buttonProps: continueButtonProps }}
        />
      </View>
    );
  };

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
