import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import I18n from "../../../../i18n";
import { Body } from "../../../../components/core/typography/Body";
import { H5 } from "../../../../components/core/typography/H5";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import IconFont from "../../../../components/ui/IconFont";
import { BpdAmount } from "../store/actions/amount";
import { BpdPeriod } from "../store/actions/periods";
import { formatNumberAmount } from "../../../../utils/stringBuilder";
import { format } from "../../../../utils/dates";
import { H4 } from "../../../../components/core/typography/H4";
import { TranslationKeys } from "../../../../../locales/locales";
import { bottomSheetContent } from "../../../../utils/bottomSheet";

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

const BPDTransactionSummaryComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { present, dismiss } = useBottomSheetModal();

  const openModalBox = async () => {
    const bottomSheetProps = await bottomSheetContent(
      <>
        <View spacer />
        <Body>
          {I18n.t(
            "bonus.bpd.details.transaction.detail.summary.bottomSheet.body"
          )}
        </Body>
      </>,
      I18n.t("bonus.bpd.details.transaction.detail.summary.bottomSheet.title"),
      522,
      dismiss
    );

    present(bottomSheetProps.content, {
      ...bottomSheetProps.config
    });
  };

  return (
    <>
      <TouchableDefaultOpacity style={styles.row} onPress={openModalBox}>
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
        <H4 weight={"Bold"}>{`${format(
          props.period.startDate,
          "DD MMM YYYY"
        )} - ${format(props.period.endDate, "DD MMM YYYY")} `}</H4>
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

export default BPDTransactionSummaryComponent;
