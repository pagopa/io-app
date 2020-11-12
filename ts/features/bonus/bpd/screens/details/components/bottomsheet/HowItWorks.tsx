import { View } from "native-base";
import * as React from "react";
import Markdown from "../../../../../../../components/ui/Markdown";
import I18n from "../../../../../../../i18n";
import { useIOBottomSheet } from "../../../../../../../utils/bottomSheet";
import { format } from "../../../../../../../utils/dates";
import { BpdPeriod } from "../../../../store/actions/periods";

type Props = {
  period: BpdPeriod;
};

/**
 * Display information about the current period
 * @constructor
 */
export const HowItWorks: React.FunctionComponent<Props> = props => (
  <View>
    <View spacer={true} />
    <View style={{ flex: 1 }}>
      <Markdown>
        {I18n.t("bonus.bpd.details.howItWorks.body", {
          ...props.period,
          startDate: format(props.period.startDate, "DD MMMM YYYY"),
          endDate: format(props.period.endDate, "DD MMMM YYYY")
        })}
      </Markdown>
    </View>
  </View>
);

export const useHowItWorksBottomSheet = (period: BpdPeriod) =>
  useIOBottomSheet(
    <HowItWorks period={period} />,
    I18n.t("bonus.bpd.details.howItWorks.title"),
    569
  );
