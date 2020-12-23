import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { InfoBox } from "../../../../components/box/InfoBox";
import { Body } from "../../../../components/core/typography/Body";
import { H4 } from "../../../../components/core/typography/H4";
import { H5 } from "../../../../components/core/typography/H5";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import IconFont from "../../../../components/ui/IconFont";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { useIOBottomSheet } from "../../../../utils/bottomSheet";
import { localeDateFormat } from "../../../../utils/locale";
import { formatNumberAmount } from "../../../../utils/stringBuilder";
import { BpdAmount } from "../saga/networking/amount";
import { BpdPeriod } from "../store/actions/periods";

type Props = {
  lastUpdateDate: string;
  period: BpdPeriod;
  totalAmount: BpdAmount;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center"
  }
});

const CSS_STYLE = `
body {
  font-size: 16;
  color: ${IOColors.black}
}
`;

const BpdTransactionSummaryComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { present } = useIOBottomSheet(
    <>
      <View spacer={true} large={true} />
      <InfoBox iconName={"io-calendar"} iconSize={32}>
        <H4 weight={"Regular"}>
          {I18n.t(
            "bonus.bpd.details.transaction.detail.summary.calendarBlock.text1"
          )}
          <H4>
            {" "}
            {I18n.t(
              "bonus.bpd.details.transaction.detail.summary.calendarBlock.text2"
            )}
          </H4>
          {I18n.t(
            "bonus.bpd.details.transaction.detail.summary.calendarBlock.text3"
          )}
        </H4>
      </InfoBox>
      <View spacer={true} large={true} />
      <Markdown cssStyle={CSS_STYLE}>
        {I18n.t(
          "bonus.bpd.details.transaction.detail.summary.bottomSheet.body"
        )}
      </Markdown>
    </>,
    I18n.t("bonus.bpd.details.transaction.detail.summary.bottomSheet.title"),
    522
  );

  return (
    <>
      <TouchableDefaultOpacity style={styles.row} onPress={present}>
        <IconFont name={"io-notice"} size={24} color={IOColors.blue} />
        <View hspacer={true} small={true} />
        <View>
          <H5 color={"bluegrey"} weight={"Regular"}>
            {I18n.t("bonus.bpd.details.transaction.detail.summary.lastUpdated")}
            <H5 color={"bluegrey"} weight={"SemiBold"}>
              {props.lastUpdateDate}
            </H5>
          </H5>
          <H5 color={"blue"} weight={"SemiBold"}>
            {I18n.t("bonus.bpd.details.transaction.detail.summary.link")}
          </H5>
        </View>
      </TouchableDefaultOpacity>
      <View spacer={true} />
      <Body>
        {I18n.t("bonus.bpd.details.transaction.detail.summary.body.text1")}
        <H4 weight={"Bold"}>{`${localeDateFormat(
          props.period.startDate,
          I18n.t("global.dateFormats.fullFormatFullMonthLiteral")
        )} - ${localeDateFormat(
          props.period.endDate,
          I18n.t("global.dateFormats.fullFormatFullMonthLiteral")
        )} `}</H4>
        {I18n.t("bonus.bpd.details.transaction.detail.summary.body.text2")}
        <H4 weight={"Bold"}>
          {I18n.t("bonus.bpd.details.transaction.detail.summary.body.text3", {
            defaultValue: I18n.t(
              "bonus.bpd.details.transaction.detail.summary.body.text3.other",
              { count: props.totalAmount.transactionNumber }
            ),
            count: props.totalAmount.transactionNumber
          })}
        </H4>
        {I18n.t("bonus.bpd.details.transaction.detail.summary.body.text4")}
        <H4 weight={"Bold"}>{`${I18n.t(
          "bonus.bpd.details.transaction.detail.summary.body.text5"
        )}${formatNumberAmount(props.totalAmount.totalCashback)} euro.`}</H4>
      </Body>
    </>
  );
};

export default BpdTransactionSummaryComponent;
