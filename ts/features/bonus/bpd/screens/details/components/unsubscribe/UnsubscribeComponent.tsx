import { View } from "native-base";
import * as React from "react";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { BottomSheetContent } from "../../../../../../../components/bottomSheet/BottomSheetContent";
import { H3 } from "../../../../../../../components/core/typography/H3";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../../../../components/ui/IconFont";
import Markdown from "../../../../../../../components/ui/Markdown";
import I18n from "../../../../../../../i18n";
import {
  cancelButtonProps,
  errorButtonProps
} from "../../../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { Label } from "../../../../../../../components/core/typography/Label";

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
      // <FooterWithButtons
      //   type={"TwoButtonsInlineThird"}
      //   leftButton={cancelButtonProps(props.onCancel)}
      //   rightButton={errorButtonProps(
      //     props.onConfirm,
      //     I18n.t("bonus.bpd.unsubscribe.confirmCta")
      //   )}
      // />
      <View>
        <View
          style={{
            ...IOStyles.horizontalContentPadding,
            backgroundColor: "#123AAF"
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: "red"
            }}
          >
            <TouchableOpacity
              onPress={() => console.log("asdasd")}
              style={{
                height: 40,
                borderRadius: 4,
                backgroundColor: IOColors.blue,
                padding: 8,
                flexGrow: 1,
                alignContent: "center"
              }}
            >
              <Label color={"white"} style={{ textAlign: "center" }}>
                a
              </Label>
            </TouchableOpacity>
            <View hspacer={true} />
            <TouchableOpacity
              onPress={() => console.log("asdasd")}
              style={{
                height: 40,
                borderRadius: 4,
                backgroundColor: IOColors.blue,
                padding: 8,
                alignContent: "center",
                flexGrow: 2
              }}
            >
              <Label color={"white"} style={{ textAlign: "center" }}>
                b
              </Label>
            </TouchableOpacity>
          </View>
        </View>
        <View spacer={true} />
      </View>
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
