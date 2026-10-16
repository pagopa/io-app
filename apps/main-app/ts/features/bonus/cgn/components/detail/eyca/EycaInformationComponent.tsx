import {
  IOButton,
  IOMarkdownLite,
  IOToast,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";

import { useIOSelector } from "../../../../../../store/hooks";
import { getEYCABaseUrl } from "../../../../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../../../utils/url";

/**
 * This component shows information about EYCA card. It is included within a
 * bottom sheet
 *
 * @class
 */
const EycaInformationComponent: React.FunctionComponent = () => {
  const eycaBaseUrl = useIOSelector(getEYCABaseUrl);
  return (
    <>
      <IOMarkdownLite
        content={I18n.t("bonus.cgn.detail.status.eycaDescription")}
      />
      <VSpacer size={16} />
      <IOButton
        fullWidth
        label={I18n.t("bonus.cgn.detail.cta.eyca.bottomSheet")}
        onPress={() =>
          openWebUrl(eycaBaseUrl, () =>
            IOToast.error(I18n.t("bonus.cgn.generic.linkError"))
          )
        }
        variant="outline"
      />

      <VSpacer size={16} />
    </>
  );
};

export const useEycaInformationBottomSheet = () =>
  useIOBottomSheetModal({
    component: <EycaInformationComponent />,
    title: I18n.t("bonus.cgn.detail.status.eycaBottomSheetTitle")
  });
