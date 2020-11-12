import * as React from "react";
import { View } from "native-base";
import { InfoBox } from "../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../components/core/typography/Body";
import I18n from "../../../../../../../i18n";
import { EnhancedBpdTransaction } from "../../../../components/transactionItem/BpdTransactionItem";

type Props = { transaction: EnhancedBpdTransaction };

/**
 * Displays a warning when certain conditions occur
 * @param props
 * @constructor
 */
export const BpdTransactionWarning: React.FunctionComponent<Props> = props => {
  if (
    props.transaction.maxCashbackForTransactionAmount ===
    props.transaction.cashback
  ) {
    return (
      <>
        <View spacer={true} />
        <InfoBox>
          <Body>
            {I18n.t("bonus.bpd.details.transaction.detail.maxCashbackWarning", {
              amount: props.transaction.maxCashbackForTransactionAmount
            })}
          </Body>
        </InfoBox>
      </>
    );
  }
  if (props.transaction.cashback <= 0) {
    return (
      <>
        <View spacer={true} />
        <InfoBox>
          <Body>
            {I18n.t(
              props.transaction.cashback < 0
                ? "bonus.bpd.details.transaction.detail.canceledOperationWarning"
                : "bonus.bpd.details.transaction.detail.maxCashbackForPeriodWarning"
            )}
          </Body>
        </InfoBox>
      </>
    );
  }
  return null;
};
