import { IOToast, IOVisualCostants } from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { getDeviceId } from "../../../../../utils/device";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useFIMSRemoteServiceConfiguration } from "../../../../fims/common/hooks";
import BonusInformationComponent from "../../../common/components/BonusInformationComponent";
import { availableBonusTypesSelectorFromId } from "../../../common/store/selectors";
import { ID_CDC_TYPE } from "../../../common/utils";
import * as analytics from "../../analytics";
import { cdcCtaConfigSelector } from "../../store/selectors/remoteConfig";

const CdcBonusRequestInformationTos = () => {
  const cdcInfo = useIOSelector(availableBonusTypesSelectorFromId(ID_CDC_TYPE));
  const { startFIMSAuthenticationFlow } =
    useFIMSRemoteServiceConfiguration("cdc-onboarding");
  const ctaConfig = useIOSelector(cdcCtaConfigSelector);

  useOnFirstRender(() => {
    analytics.trackCdcRequestIntro();
  });

  if (cdcInfo === undefined) {
    return null;
  }

  const onStartCdcFlow = () => {
    if (!ctaConfig?.url) {
      IOToast.error(I18n.t("global.genericError"));
      return;
    }
    const url = new URL(ctaConfig.url);
    if (ctaConfig.includeDeviceId) {
      url.searchParams.set("device", getDeviceId());
    }
    analytics.trackCdcRequestIntroContinue();
    startFIMSAuthenticationFlow(I18n.t("bonus.cdc.request"), url.toString());
  };

  return (
    <BonusInformationComponent
      bonus={cdcInfo}
      contextualHelp={emptyContextualHelp}
      primaryCtaText={I18n.t("global.buttons.continue")}
      onConfirm={onStartCdcFlow}
      imageStyle={{
        aspectRatio: 2,
        resizeMode: "contain",
        marginHorizontal: IOVisualCostants.appMarginDefault
      }}
    />
  );
};

export default CdcBonusRequestInformationTos;
