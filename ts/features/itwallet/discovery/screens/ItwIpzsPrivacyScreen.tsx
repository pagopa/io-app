import { useState } from "react";
import { ContentWrapper, H2, VSpacer } from "@pagopa/io-app-design-system";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import ItwPrivacyWebViewComponent from "../components/ItwPrivacyWebViewComponent";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { trackOpenItwTosAccepted } from "../../analytics";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import { ITW_IPZS_PRIVACY_URL_BODY } from "../../../../urls";
import { generateDynamicUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useIOSelector } from "../../../../store/hooks";

const ItwIpzsPrivacyScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const privacyUrl = useIOSelector(state =>
    generateDynamicUrlSelector(state, "io_showcase", ITW_IPZS_PRIVACY_URL_BODY)
  );
  const handleContinuePress = () => {
    trackOpenItwTosAccepted();
    machineRef.send({ type: "accept-ipzs-privacy" });
  };

  const onLoadEnd = () => {
    setIsLoading(false);
  };

  const onError = () => {
    onLoadEnd();
    machineRef.send({ type: "error", scope: "ipzs-privacy" });
  };

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    supportRequest: true
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <ContentWrapper>
        <H2
          accessible={true}
          accessibilityRole="header"
          testID="screen-content-header-title"
        >
          {I18n.t("features.itWallet.ipzsPrivacy.title")}
        </H2>
        <VSpacer size={16} />
        <ItwMarkdown>
          {I18n.t("features.itWallet.ipzsPrivacy.warning")}
        </ItwMarkdown>
      </ContentWrapper>
      <ItwPrivacyWebViewComponent
        source={{
          uri: privacyUrl
        }}
        onAcceptTos={handleContinuePress}
        onLoadEnd={onLoadEnd}
        onError={onError}
      />
    </LoadingSpinnerOverlay>
  );
};

export default ItwIpzsPrivacyScreen;
