import { View } from "native-base";
import * as React from "react";
import { BottomSheetContent } from "../../../../../../../components/bottomSheet/BottomSheetContent";
import { H3 } from "../../../../../../../components/core/typography/H3";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../../../../components/ui/IconFont";
import Markdown from "../../../../../../../components/ui/Markdown";
import I18n from "../../../../../../../i18n";
import {
  cancelButtonProps,
  errorButtonProps
} from "../../../../../bonusVacanze/components/buttons/ButtonConfigurations";

type Props = { onCancel: () => void; onConfirm: () => void };

const iconSize = 64;

/**
 * Informs the user about the consequences of the cashback unsubscription
 * @param props
 * @constructor
 */
export const UnsubscribeComponent: React.FunctionComponent<Props> = props => (
  <BottomSheetContent
    footer={
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={{
          ...cancelButtonProps(props.onCancel),
          onPressWithGestureHandler: true
        }}
        rightButton={{
          ...errorButtonProps(
            props.onConfirm,
            I18n.t("bonus.bpd.unsubscribe.confirmCta")
          ),
          onPressWithGestureHandler: true
        }}
      />
    }
  >
    <View style={{ justifyContent: "space-between" }}>
      <View spacer={true} />
      <IconFont name={"io-notice"} size={iconSize} color={IOColors.red} />
      <View spacer={true} />
      <H3 color={"red"}>{I18n.t("bonus.bpd.unsubscribe.body1")}</H3>
      <View spacer={true} />
      <Markdown>{I18n.t("bonus.bpd.unsubscribe.body2")}</Markdown>
    </View>
  </BottomSheetContent>
);
