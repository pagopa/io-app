import * as React from "react";
import { InfoBox } from "../../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../../components/core/typography/Body";
import I18n from "../../../../../../../../i18n";
import { dateToAccessibilityReadableFormat } from "../../../../../../../../utils/accessibility";
import { BpdPeriod } from "../../../../../store/actions/periods";

/**
 * Inform the user about the start date of the next period
 * @param props
 * @constructor
 */
export const InactiveTextualSummary = (props: {
  period: BpdPeriod;
}): React.ReactElement => (
  <InfoBox>
    <Body testID={"inactivePeriod"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.inactivePeriodBody",
        {
          date: dateToAccessibilityReadableFormat(props.period.startDate)
        }
      )}
    </Body>
  </InfoBox>
);
