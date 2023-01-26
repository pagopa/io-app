import * as React from "react";
import { connect } from "react-redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import Markdown from "../../../../../components/ui/Markdown";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import {
  formatIntegerNumber,
  formatNumberWithNoDigits
} from "../../../../../utils/stringBuilder";
import { isBpdRankingReady } from "../../store/reducers/details/periods";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";
import { isInGracePeriod } from "../../utils/dates";
import { LastPositionItem } from "./LastPositionItem";
import SuperCashbackHeader from "./SuperCashbackHeader";
import UserPositionItem from "./UserPositionItem";

type Props = ReturnType<typeof mapStateToProps>;

const RankingItems: React.FunctionComponent<Props> = (props: Props) => {
  if (props.selectedPeriod && isBpdRankingReady(props.selectedPeriod.ranking)) {
    const mapRankingItems: Map<number, React.ReactNode> = new Map<
      number,
      React.ReactNode
    >([
      [
        props.selectedPeriod.minPosition,
        <LastPositionItem
          key={`item-${props.selectedPeriod.minPosition}`}
          superCashbackAmount={props.selectedPeriod.superCashbackAmount}
          transactionsNumber={props.selectedPeriod.ranking.minTransactionNumber}
          lastAvailablePosition={props.selectedPeriod.minPosition}
        />
      ],
      [
        props.selectedPeriod.ranking.ranking,
        <UserPositionItem
          key={`item-${props.selectedPeriod.ranking.ranking}`}
          superCashbackAmount={props.selectedPeriod.superCashbackAmount}
          transactionsNumber={props.selectedPeriod.ranking.transactionNumber}
          hideBadge={
            props.selectedPeriod.ranking.ranking >
            props.selectedPeriod.minPosition
          }
          userPosition={props.selectedPeriod.ranking.ranking}
        />
      ]
    ]);

    const key = [...mapRankingItems.keys()].sort((a, b) => a - b);

    return <>{key.map(k => mapRankingItems.get(k))}</>;
  }

  return null;
};

const CSS_STYLE = `
body {
  color: ${IOColors.bluegreyDark}
}
`;

const SuperCashbackBottomSheet: React.FunctionComponent<Props> = (
  props: Props
) => (
  <>
    <VSpacer size={16} />
    <RankingItems {...props} />
    <VSpacer size={8} />
    <ItemSeparatorComponent noPadded={true} />
    <VSpacer size={16} />
    <H3>{I18n.t("bonus.bpd.details.superCashback.howItWorks.title")}</H3>
    <VSpacer size={16} />
    {props.selectedPeriod && (
      <>
        <Markdown cssStyle={CSS_STYLE} avoidTextSelection>
          {I18n.t("bonus.bpd.details.superCashback.howItWorks.body", {
            citizens: formatIntegerNumber(props.selectedPeriod.minPosition),
            amount: formatNumberWithNoDigits(
              props.selectedPeriod.superCashbackAmount
            )
          })}
        </Markdown>
        <VSpacer size={16} />
        {props.selectedPeriod.status === "Active" ||
        isInGracePeriod(
          props.selectedPeriod.endDate,
          props.selectedPeriod.gracePeriod
        ) ? (
          <Markdown cssStyle={CSS_STYLE} avoidTextSelection>
            {I18n.t("bonus.bpd.details.superCashback.howItWorks.status.active")}
          </Markdown>
        ) : (
          <H4 weight={"Bold"}>
            {I18n.t("bonus.bpd.details.superCashback.howItWorks.status.closed")}
          </H4>
        )}
      </>
    )}
  </>
);

const mapStateToProps = (state: GlobalState) => ({
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

const SuperCashbackRanking = connect(mapStateToProps)(SuperCashbackBottomSheet);

export default SuperCashbackRanking;

export const useSuperCashbackRankingBottomSheet = () =>
  useIOBottomSheetModal(<SuperCashbackRanking />, <SuperCashbackHeader />, 470);
