import { View } from "native-base";
import * as React from "react";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
import { BottomSheetBpdTransactionsBody } from "../../../components/BottomSheetBpdTransactionsBody";

const BpdEmptyTransactionsList: React.FunctionComponent = () => (
  <>
    <InfoBox iconName={"io-warning"} iconSize={32} alignedCentral={true}>
      <H4>{I18n.t("bonus.bpd.details.transaction.detail.empty.text1")}</H4>
      <Body>{I18n.t("bonus.bpd.details.transaction.detail.empty.text2")}</Body>
    </InfoBox>
    <View spacer={true} />
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
    <BottomSheetBpdTransactionsBody />
  </>
);

export default BpdEmptyTransactionsList;
