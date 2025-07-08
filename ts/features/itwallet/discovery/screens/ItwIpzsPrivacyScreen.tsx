import { ContentWrapper, H2, VSpacer } from "@pagopa/io-app-design-system";
import { useState } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { generateDynamicUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { ITW_IPZS_PRIVACY_URL_BODY } from "../../../../urls";
import { trackOpenItwTosAccepted } from "../../analytics";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { isL3FeaturesEnabledSelector } from "../../machine/eid/selectors";
import ItwPrivacyWebViewComponent from "../components/ItwPrivacyWebViewComponent";

const ItwIpzsPrivacyScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );

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
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
      <IOScrollView
        includeContentMargins={false}
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t(
              "features.itWallet.discovery.ipzsPrivacy.button.label"
            ),
            accessibilityLabel: I18n.t(
              "features.itWallet.discovery.ipzsPrivacy.button.label"
            ),
            onPress: handleContinuePress
          }
        }}
      >
        <ContentWrapper>
          <H2
            accessible={true}
            accessibilityRole="header"
            testID="screen-content-header-title"
          >
            {I18n.t(
              isL3
                ? "features.itWallet.discovery.ipzsPrivacy.titleL3"
                : "features.itWallet.discovery.ipzsPrivacy.title"
            )}
          </H2>
          <VSpacer size={16} />
          <IOMarkdown
            content={I18n.t("features.itWallet.discovery.ipzsPrivacy.warning")}
          />
        </ContentWrapper>
        <ItwPrivacyWebViewComponent
          source={{
            uri: privacyUrl
          }}
          onLoadEnd={onLoadEnd}
          onError={onError}
        />
      </IOScrollView>
    </LoadingSpinnerOverlay>
  );
};

export default ItwIpzsPrivacyScreen;
