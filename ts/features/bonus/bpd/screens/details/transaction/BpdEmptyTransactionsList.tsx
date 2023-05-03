import { View } from "react-native";
import * as React from "react";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
import { BottomSheetBpdTransactionsBody } from "../../../components/BpdTransactionSummaryComponent";

const BpdEmptyTransactionsList: React.FunctionComponent = () => (
  <>
    <InfoBox iconName="notice" iconSize={32} alignedCentral={true}>
      <H4>{I18n.t("bonus.bpd.details.transaction.detail.empty.text1")}</H4>
      <Body>{I18n.t("bonus.bpd.details.transaction.detail.empty.text2")}</Body>
    </InfoBox>

    <VSpacer size={16} />
    <View testID={"BpdEmptyTransactionsList"} />
    <InfoBox iconName="legCalendar" iconSize={32}>
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
    <VSpacer size={24} />
    <BottomSheetBpdTransactionsBody />
  </>
);

export default BpdEmptyTransactionsList;
