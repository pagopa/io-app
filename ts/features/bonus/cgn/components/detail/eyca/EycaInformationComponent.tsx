import * as React from "react";
import { View } from "react-native";
import { VSpacer } from "@pagopa/io-app-design-system";
import ButtonDefaultOpacity from "../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../components/core/typography/Label";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../../../utils/hooks/bottomSheet";
import { showToast } from "../../../../../../utils/showToast";
import { openWebUrl } from "../../../../../../utils/url";
import { EYCA_WEBSITE_BASE_URL } from "../../../utils/constants";

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
        <Markdown avoidTextSelection onLoadEnd={() => setMarkdownloaded(true)}>
          {I18n.t("bonus.cgn.detail.status.eycaDescription")}
        </Markdown>
        <VSpacer size={16} />
        {isMarkdownloaded && (
          <ButtonDefaultOpacity
            style={{ width: "100%" }}
            bordered
            onPress={() =>
              openWebUrl(EYCA_WEBSITE_BASE_URL, () =>
                showToast(I18n.t("bonus.cgn.generic.linkError"))
              )
            }
            onPressWithGestureHandler
          >
            <Label color={"blue"}>
              {I18n.t("bonus.cgn.detail.cta.eyca.bottomSheet")}
            </Label>
          </ButtonDefaultOpacity>
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
