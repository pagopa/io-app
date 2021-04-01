import * as React from "react";
import { formatNumberWithNoDigits } from "../../../../../utils/stringBuilder";
import I18n from "../../../../../i18n";
import RankPositionItem from "./RankPositionItem";

type Props = {
  transactionsNumber: number;
  superCashbackAmount: number;
  lastAvailablePosition: number;
};

const THOUSAND_UNIT = 1000;

const retrieveBoxedLabel = (lastAvailablePosition: number) =>
  lastAvailablePosition >= THOUSAND_UNIT
    ? `${Math.floor(lastAvailablePosition / THOUSAND_UNIT)}K`
    : `${lastAvailablePosition}`;

export const LastPositionItem: React.FunctionComponent<Props> = (
  props: Props
) => (
  <RankPositionItem
    transactionsNumber={props.transactionsNumber}
    superCashbackAmount={props.superCashbackAmount}
    boxedLabel={retrieveBoxedLabel(props.lastAvailablePosition)}
    rankingLabel={I18n.t("bonus.bpd.details.superCashback.rankLabel", {
      position: formatNumberWithNoDigits(props.lastAvailablePosition)
    })}
  />
);
