import * as React from "react";
import { formatNumberWithNoDigits } from "../../../../../utils/stringBuilder";
import I18n from "../../../../../i18n";
import RankPositionItem from "./RankPositionItem";

type Props = {
  transactionsNumber: number;
  superCashbackAmount: number;
  lastAvailablePosition: number;
};

export const LastPositionItem: React.FunctionComponent<Props> = (
  props: Props
) => (
  <RankPositionItem
    transactionsNumber={props.transactionsNumber}
    superCashbackAmount={props.superCashbackAmount}
    boxedLabel={"100k"}
    rankingLabel={I18n.t("bonus.bpd.details.superCashback.rankLabel", {
      position: formatNumberWithNoDigits(props.lastAvailablePosition)
    })}
  />
);
