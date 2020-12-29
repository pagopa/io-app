import * as React from "react";
import { InfoBox } from "../../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../../components/core/typography/Body";
import I18n from "../../../../../../../../i18n";
import { dateToAccessibilityReadableFormat } from "../../../../../../../../utils/accessibility";
import { localeDateFormat } from "../../../../../../../../utils/locale";
import { BpdPeriod } from "../../../../../store/actions/periods";
import { isGracePeriod } from "../../../../../store/reducers/details/periods";
import { TextualSummary } from "./TextualSummary";

type Props = React.ComponentProps<typeof TextualSummary>;

/**
 * We await receipt of the latest transactions to consolidate the count
 * @param props
 * @constructor
 */
const GracePeriod = (props: { period: BpdPeriod }) => (
  <InfoBox iconName={"io-hourglass"}>
    <Body testID={"gracePeriod"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.gracePeriodBody",
        {
          date: dateToAccessibilityReadableFormat(props.period.endDate)
        }
      )}
    </Body>
  </InfoBox>
);

/**
 * The user doesn't receive the amount (not enough transactions for the closed period)
 * @param props
 * @constructor
 */
const KO = (props: Props) => (
  <InfoBox iconName={"io-sad"}>
    <Body testID={"closedPeriodKO"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.closedPeriodKOBody",
        {
          transactions: props.period.minTransactionNumber,
          amount: props.period.amount.totalCashback
        }
      )}
    </Body>
  </InfoBox>
);

const transferDate = (period: BpdPeriod) => {
  const endDate = new Date(period.endDate);

  // 60: max days to receive the money transfer
  endDate.setDate(period.endDate.getDate() + 60);
  return endDate;
};

/**
 * The user will receive the refund!
 * @param props
 * @constructor
 */
const OK = (props: Props) => (
  <InfoBox iconName={"io-happy"}>
    <Body testID={"closedPeriodOK"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.closedPeriodOKBody",
        {
          name: props.name,
          amount: props.period.amount.totalCashback
        }
      )}
      {/* If the max amount is reached, inform the user */}
      {props.period.amount.totalCashback >= props.period.maxPeriodCashback
        ? ": " +
          I18n.t(
            "bonus.bpd.details.components.transactionsCountOverview.closedPeriodMaxAmount"
          )
        : "!"}
      {"\n"}
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.moneyTransfer",
        {
          date: localeDateFormat(
            transferDate(props.period),
            I18n.t("global.dateFormats.fullFormatFullMonthLiteral")
          )
        }
      )}
    </Body>
  </InfoBox>
);

/**
 * Return a textual summary for a closed period
 * @param props
 * @constructor
 */
export const ClosedTextualSummary = (props: Props) => {
  // we are still in the grace period and warns the user that some transactions
  // may still be pending
  if (isGracePeriod(props.period)) {
    return <GracePeriod {...props} />;
  }
  // not enough transaction to receive the cashback
  if (
    props.period.amount.transactionNumber < props.period.minTransactionNumber
  ) {
    return <KO {...props} />;
  }
  // Congratulation! cashback received
  return <OK {...props} />;
};
