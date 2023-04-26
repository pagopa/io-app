import * as React from "react";
import { SafeAreaView } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { constNull } from "fp-ts/lib/function";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { LoadingErrorComponent } from "../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { fciSignatureSelector } from "../../store/reducers/fciSignature";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import paymentCompleted from "../../../../../img/pictograms/payment-completed.png";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import { fciEndRequest, fciStartRequest } from "../../store/actions";
import { mixpanelTrack } from "../../../../mixpanel";

const FciThankyouScreen = () => {
  const fciCreateSignatureSelector = useIOSelector(fciSignatureSelector);
  const dispatch = useIODispatch();

  const LoadingComponent = () => (
    <LoadingErrorComponent
      isLoading={true}
      loadingCaption={""}
      onRetry={constNull}
      testID={"FciTypLoadingScreenTestID"}
    />
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

  const SuccessComponent = () => (
    <BaseScreenComponent goBack={false}>
      <SafeAreaView style={IOStyles.flex} testID={"FciTypSuccessTestID"}>
        <InfoScreenComponent
          image={renderInfoRasterImage(paymentCompleted)}
          title={I18n.t("features.fci.thankYouPage.title")}
          body={I18n.t("features.fci.thankYouPage.content")}
        />
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            onPress: () => dispatch(fciEndRequest()),
            title: I18n.t("features.fci.thankYouPage.cta"),
            block: true,
            light: false,
            bordered: true,
            testID: "FciTypSuccessFooterButton"
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );

  return pot.fold(
    fciCreateSignatureSelector,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    _ => <ErrorComponent />,
    _ => {
      void mixpanelTrack("FCI_UX_SUCCESS");
      return <SuccessComponent />;
    },
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    _ => <ErrorComponent />
  );
};

export default FciThankyouScreen;
