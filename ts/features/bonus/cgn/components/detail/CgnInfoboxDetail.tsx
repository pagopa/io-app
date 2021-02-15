import * as React from "react";
import { StyleSheet } from "react-native";
import { View } from "native-base";
import { fromNullable } from "fp-ts/lib/Option";
import { CgnStatus } from "../../../../../../definitions/cgn/CgnStatus";
import IconFont from "../../../../../components/ui/IconFont";
import { H4 } from "../../../../../components/core/typography/H4";
import TypedI18n from "../../../../../i18n";
import { localeDateFormat } from "../../../../../utils/locale";
import { IOColors } from "../../../../../components/core/variables/IOColors";

type Props = {
  cgnDetail: CgnStatus;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center"
  },
  contentExtraPadding: {
    paddingHorizontal: 12
  },
  textStyle: {
    paddingVertical: 8
  },
  alignedCentral: {
    alignItems: "center"
  }
});

const ICON_SIZE = 24;

type IconTextInformation = {
  icon: string;
  text: React.ReactNode;
};

const textAndIconFromStatus = ({
  cgnDetail
}: Props): IconTextInformation | undefined => {
  switch (cgnDetail.status) {
    case "ACTIVATED":
      return {
        icon: "io-complete",
        text: (
          <H4 testID={"infobox-text"}>
            {TypedI18n.t("bonus.cgn.detail.information.active", {
              date: localeDateFormat(
                cgnDetail.expiration_date,
                TypedI18n.t("global.dateFormats.shortFormat")
              )
            })}
          </H4>
        )
      };
    case "EXPIRED":
      return {
        icon: "io-notice",
        text: (
          <H4 testID={"infobox-text"}>
            <H4 weight={"Bold"} testID={"infobox-text-warning"}>
              {TypedI18n.t("bonus.cgn.detail.information.warning")}
            </H4>
            {TypedI18n.t("bonus.cgn.detail.information.expired", {
              date: localeDateFormat(
                cgnDetail.expiration_date,
                TypedI18n.t("global.dateFormats.shortFormat")
              )
            })}
          </H4>
        )
      };
    case "REVOKED":
      return {
        icon: "io-notice",
        text: (
          <H4 testID={"infobox-text"}>
            <H4 weight={"Bold"} testID={"infobox-text-warning"}>
              {TypedI18n.t("bonus.cgn.detail.information.warning")}
            </H4>
            {TypedI18n.t("bonus.cgn.detail.information.revoked", {
              reason: cgnDetail.revocation_reason
            })}
          </H4>
        )
      };
    default:
      return undefined;
  }
};

/**
 * Renders the status infobox on the center top of the screen
 * the message differs based on the status of the card
 * @param props
 * @constructor
 */
const CgnInformationText: React.FunctionComponent<Props> = (props: Props) => {
  const info = textAndIconFromStatus(props);
  return fromNullable(info).fold(null, i => (
    <View
      style={[styles.row, styles.contentExtraPadding, styles.alignedCentral]}
    >
      <IconFont name={i.icon} color={IOColors.bluegrey} size={ICON_SIZE} />
      <View hspacer={true} />
      {i.text}
    </View>
  ));
};

export default CgnInformationText;
