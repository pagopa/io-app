import * as React from "react";
import { View } from "native-base";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { useIOBottomSheet } from "../../../../../../utils/bottomSheet";
import { openWebUrl } from "../../../../../../utils/url";
import ButtonDefaultOpacity from "../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../components/core/typography/Label";

const EYCA_DISCOUNTS_URL = "https://www.eyca.org/discounts/it";

const EycaInformationComponent: React.FunctionComponent = () => (
  <View>
    <View spacer />
    <View style={{ flex: 1 }}>
      <Markdown avoidTextSelection>
        {I18n.t("bonus.cgn.detail.status.eycaDescription")}
      </Markdown>
      <View spacer large />
      <ButtonDefaultOpacity
        style={{ width: "100%" }}
        bordered
        onPress={() => openWebUrl(EYCA_DISCOUNTS_URL)}
        onPressWithGestureHandler
      >
        <Label color={"blue"}>
          {I18n.t("bonus.cgn.detail.cta.eyca.bottomSheet")}
        </Label>
      </ButtonDefaultOpacity>
    </View>
  </View>
);

export const useEycaInformationBottomSheet = () =>
  useIOBottomSheet(
    <EycaInformationComponent />,
    I18n.t("bonus.cgn.detail.status.eycaBottomSheetTitle"),
    420
  );
