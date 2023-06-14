import * as React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { Body } from "../../../../components/core/typography/Body";
import { H4 } from "../../../../components/core/typography/H4";
import { InfoBox } from "../../../../components/box/InfoBox";
import { useLegacyIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { Link } from "../../../../components/core/typography/Link";
import { openWebUrl } from "../../../../utils/url";
import Markdown from "../../../../components/ui/Markdown";
import { IOColors } from "../../../../components/core/variables/IOColors";
import I18n from "../../../../i18n";
import { localeDateFormat } from "../../../../utils/locale";
import {
  formatIntegerNumber,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import { BpdAmount } from "../saga/networking/amount";
import { BpdPeriod } from "../store/actions/periods";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

type Props = {
  lastUpdateDate: string;
  period: BpdPeriod;
  totalAmount: BpdAmount;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  readMore: { marginLeft: 31, marginBottom: 24 }
});

const readMoreLink = "https://io.italia.it/cashback/acquirer/";

const CSS_STYLE = `
body {
  font-size: 16;
  color: ${IOColors.black}
}
`;

export const BottomSheetBpdTransactionsBody: React.FunctionComponent = () => {
  const [CTAVisibility, setCTAVisibility] = React.useState(false);

  const setCTAVisible = () => setCTAVisibility(true);

  return (
    <>
      <Markdown
        cssStyle={CSS_STYLE}
        avoidTextSelection={true}
        onLoadEnd={setCTAVisible}
      >
        {I18n.t(
          "bonus.bpd.details.transaction.detail.summary.bottomSheet.body"
        )}
      </Markdown>
      {CTAVisibility && (
        <TouchableWithoutFeedback onPress={() => openWebUrl(readMoreLink)}>
          <Link style={styles.readMore} weight={"SemiBold"}>
            {I18n.t(
              "bonus.bpd.details.transaction.detail.summary.bottomSheet.readMore"
            )}
          </Link>
        </TouchableWithoutFeedback>
      )}
    </>
  );
};

const BpdTransactionSummaryComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { present, bottomSheet } = useLegacyIOBottomSheetModal(
    <>
      <VSpacer size={24} />
      <InfoBox iconName="calendar" iconSize={32}>
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
    </>,
    I18n.t("bonus.bpd.details.transaction.detail.summary.bottomSheet.title"),
    600
  );

  return (
    <>
      <View style={styles.row}>
        <InfoBox iconName="notice" iconSize={32}>
          <H4 weight={"Regular"}>
            {I18n.t("bonus.bpd.details.transaction.detail.summary.lastUpdated")}
            <H4>{props.lastUpdateDate}</H4>
          </H4>
          <Link onPress={present} weight={"SemiBold"}>
            {I18n.t("bonus.bpd.details.transaction.detail.summary.link")}
          </Link>
        </InfoBox>
      </View>

      <VSpacer size={16} />

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
              {
                transactions: formatIntegerNumber(
                  props.totalAmount.transactionNumber
                )
              }
            ),
            count: props.totalAmount.transactionNumber,
            transactions: formatIntegerNumber(
              props.totalAmount.transactionNumber
            )
          })}
        </H4>
        {I18n.t("bonus.bpd.details.transaction.detail.summary.body.text4")}
        <H4 weight={"Bold"}>{`${I18n.t(
          "bonus.bpd.details.transaction.detail.summary.body.text5"
        )}${formatNumberAmount(props.totalAmount.totalCashback)} euro.`}</H4>
      </Body>
      {bottomSheet}
    </>
  );
};

export default BpdTransactionSummaryComponent;
