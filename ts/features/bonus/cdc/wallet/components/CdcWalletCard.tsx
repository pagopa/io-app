import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { withWalletCardBaseComponent } from "../../../../wallet/components/WalletCardBaseComponent";
import { WalletCardPressableBase } from "../../../../wallet/components/WalletCardPressableBase";
import { cdcWalletVisibilityConfigSelector } from "../../common/store/selectors/remoteConfig";
import { useIOSelector } from "../../../../../store/hooks";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { getDeviceId } from "../../../../../utils/device";
import { useFIMSRemoteServiceConfiguration } from "../../../../fims/common/hooks";
import { CdcCard, CdcCardProps } from "./CdcCard";

const WrappedCdcCard = (props: CdcCardProps) => {
  const { ...cardProps } = props;

  const cdcWalletConfig = useIOSelector(cdcWalletVisibilityConfigSelector);
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector) ?? false;

  const { startFIMSAuthenticationFlow } =
    useFIMSRemoteServiceConfiguration("cdc-onboarding");

  const handleOnPress = () => {
    if (!cdcWalletConfig?.url) {
      IOToast.error(I18n.t("global.genericError"));
      return;
    }
    const url = new URL(cdcWalletConfig.url);
    if (cdcWalletConfig.includeDeviceId && isMixpanelEnabled) {
      url.searchParams.set("device", getDeviceId());
    }
    startFIMSAuthenticationFlow(I18n.t("bonus.cdc.request"), url.toString());
  };

  return (
    <WalletCardPressableBase onPress={handleOnPress}>
      <CdcCard {...cardProps} />
    </WalletCardPressableBase>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the PaymentCard component
 */
export const CdcWalletCard = withWalletCardBaseComponent(WrappedCdcCard);
