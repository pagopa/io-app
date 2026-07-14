import { ContentWrapper, IOMarkdownLite, VSpacer } from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useState } from "react";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIOSelector } from "../../../../store/hooks";
import { trackItwPrivacyScreen } from "../../analytics";
import { ItwFlow } from "../../analytics/utils/types";
import { itwIpzsPrivacyUrlSelector } from "../../common/store/selectors/remoteConfig";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectIsLoading
} from "../../machine/eid/selectors";
import { trackOpenItwTosAccepted } from "../analytics";
import ItwPrivacyWebViewComponent from "../components/ItwPrivacyWebViewComponent";

const ItwIpzsPrivacyScreen = () => {
  const [isWebViewLoading, setWebViewLoading] = useState(true);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoadingMachine =
    ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const privacyUrl = useIOSelector(itwIpzsPrivacyUrlSelector);
  const itwFlow: ItwFlow = isL3 ? "L3" : "L2";

  useFocusEffect(
    useCallback(() => {
      trackItwPrivacyScreen(itwFlow);
    }, [itwFlow])
  );

  const handleContinuePress = () => {
    trackOpenItwTosAccepted(itwFlow);
    machineRef.send({ type: "accept-ipzs-privacy" });
  };

  const onLoadEnd = () => {
    setWebViewLoading(false);
  };

  const onError = () => {
    onLoadEnd();
    machineRef.send({ type: "error", scope: "ipzs-privacy" });
  };

  return (
    <LoadingSpinnerOverlay
      isLoading={isWebViewLoading || isLoadingMachine}
      loadingOpacity={1}
    >
      <IOScrollViewWithLargeHeader
        title={{
          label: I18n.t(
            isL3
              ? "features.itWallet.discovery.ipzsPrivacy.titleL3"
              : "features.itWallet.discovery.ipzsPrivacy.title"
          )
        }}
        headerActionsProp={{ showHelp: true }}
        contentContainerStyle={{ flexGrow: 1 }}
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
          <IOMarkdownLite
            content={I18n.t("features.itWallet.discovery.ipzsPrivacy.warning")}
          />
          <VSpacer size={16} />
        </ContentWrapper>
        <ItwPrivacyWebViewComponent
          source={{
            uri: privacyUrl ?? ""
          }}
          onLoadEnd={onLoadEnd}
          onError={onError}
        />
      </IOScrollViewWithLargeHeader>
    </LoadingSpinnerOverlay>
  );
};

export default ItwIpzsPrivacyScreen;
