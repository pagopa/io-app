import * as React from "react";
import { View } from "react-native";
import { ButtonOutline, VSpacer } from "@pagopa/io-app-design-system";
import LegacyMarkdown from "../../../../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../../../utils/url";
import { EYCA_WEBSITE_BASE_URL } from "../../../utils/constants";
import { IOToast } from "../../../../../../components/Toast";

/**
 * this component shows information about EYCA card. It is included within a bottom sheet
 * @constructor
 */
const EycaInformationComponent: React.FunctionComponent = () => {
  const [isMarkdownloaded, setMarkdownloaded] = React.useState(false);
  return (
    <View>
      <VSpacer size={16} />
      <View>
        <LegacyMarkdown
          avoidTextSelection
          onLoadEnd={() => setMarkdownloaded(true)}
        >
          {I18n.t("bonus.cgn.detail.status.eycaDescription")}
        </LegacyMarkdown>
        <VSpacer size={16} />
        {isMarkdownloaded && (
          <ButtonOutline
            fullWidth
            label={I18n.t("bonus.cgn.detail.cta.eyca.bottomSheet")}
            accessibilityLabel={I18n.t("bonus.cgn.detail.cta.eyca.bottomSheet")}
            onPress={() =>
              openWebUrl(EYCA_WEBSITE_BASE_URL, () =>
                IOToast.error(I18n.t("bonus.cgn.generic.linkError"))
              )
            }
          />
        )}
      </View>
      <VSpacer size={16} />
    </View>
  );
};

export const useEycaInformationBottomSheet = () =>
  useIOBottomSheetAutoresizableModal({
    component: <EycaInformationComponent />,
    title: I18n.t("bonus.cgn.detail.status.eycaBottomSheetTitle")
  });
