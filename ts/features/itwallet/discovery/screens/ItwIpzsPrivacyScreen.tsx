import { ContentWrapper, H2, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useState } from "react";

import IOMarkdown from "../../../../components/IOMarkdown";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../store/hooks";
import { itwIpzsPrivacyUrlSelector } from "../../common/store/selectors/remoteConfig";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectIsLoading
} from "../../machine/eid/selectors";
import { trackOpenItwTosAccepted } from "../analytics";
import ItwPrivacyWebViewComponent from "../components/ItwPrivacyWebViewComponent";

const ItwIpzsPrivacyScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoadingMachine =
    ItwEidIssuanceMachineContext.useSelector(selectIsLoading);

  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );

  const privacyUrl = useIOSelector(itwIpzsPrivacyUrlSelector);

  const handleContinuePress = () => {
    trackOpenItwTosAccepted(isL3 ? "L3" : "L2");
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

  if (isLoadingMachine) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  return (
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
      <IOScrollView
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
        contentContainerStyle={{ flexGrow: 1 }}
        includeContentMargins={false}
      >
        <ContentWrapper>
          <H2
            accessibilityRole="header"
            accessible={true}
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
          <VSpacer size={16} />
        </ContentWrapper>
        <ItwPrivacyWebViewComponent
          onError={onError}
          onLoadEnd={onLoadEnd}
          source={{
            uri: privacyUrl ?? ""
          }}
        />
      </IOScrollView>
    </LoadingSpinnerOverlay>
  );
};

export default ItwIpzsPrivacyScreen;
