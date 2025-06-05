import { IOToast } from "@pagopa/io-app-design-system";
import { BonusAvailableContent } from "../../../../../../definitions/content/BonusAvailableContent";
import IOMarkdown from "../../../../../components/IOMarkdown";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { getRemoteLocale } from "../../../../messages/utils/ctas";
import { availableBonusTypesSelectorFromId } from "../../../common/store/selectors";
import { ID_CDC_TYPE } from "../../../common/utils";
import { useFIMSRemoteServiceConfiguration } from "../../../../fims/common/hooks";
import { cdcCtaConfigSelector } from "../../store/selectors/remoteConfig";
import { getDeviceId } from "../../../../../utils/device";

const CdcBonusRequestInformationTos = () => {
  const cdcInfo = useIOSelector(availableBonusTypesSelectorFromId(ID_CDC_TYPE));
  const { startFIMSAuthenticationFlow } =
    useFIMSRemoteServiceConfiguration("cdc-onboarding");
  const ctaConfig = useIOSelector(cdcCtaConfigSelector);

  if (cdcInfo === undefined) {
    return null;
  }

  const bonusTypeLocalizedContent: BonusAvailableContent =
    cdcInfo[getRemoteLocale()];

  const onStartCdcFlow = () => {
    if (!ctaConfig?.url) {
      IOToast.error(I18n.t("global.genericError"));
      return;
    }

    const url = new URL(ctaConfig.url);
    if (ctaConfig.includeDeviceId) {
      url.searchParams.set("device", getDeviceId());
    }
    startFIMSAuthenticationFlow(I18n.t("bonus.cdc.request"), url.toString());
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: bonusTypeLocalizedContent.title
      }}
      includeContentMargins
      headerActionsProp={{
        showHelp: true
      }}
      contextualHelp={emptyContextualHelp}
      canGoback
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: onStartCdcFlow
        }
      }}
    >
      <IOMarkdown content={bonusTypeLocalizedContent.content} />
    </IOScrollViewWithLargeHeader>
  );
};

export default CdcBonusRequestInformationTos;
