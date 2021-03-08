import * as React from "react";
import { StyleSheet } from "react-native";
import { View } from "native-base";
import { fromNullable } from "fp-ts/lib/Option";
import { Card } from "../../../../../../definitions/cgn/Card";
import { H4 } from "../../../../../components/core/typography/H4";
import TypedI18n from "../../../../../i18n";
import { localeDateFormat } from "../../../../../utils/locale";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { InfoBox } from "../../../../../components/box/InfoBox";

type Props = {
  cgnDetail: Card;
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
          <H4 testID={"infobox-text"} weight={"Regular"}>
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
          <H4 testID={"infobox-text"} weight={"Regular"}>
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
    <View style={styles.contentExtraPadding}>
      <InfoBox iconName={i.icon} iconColor={IOColors.bluegrey} alignedCentral>
        {i.text}
      </InfoBox>
    </View>
  ));
};

export default CgnInformationText;
