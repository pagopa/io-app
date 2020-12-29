import * as React from "react";
import I18n from "../../../../../i18n";
import RankPositionItem from "./RankPositionItem";

type Props = {
  transactionsNumber: number;
  superCashbackAmount: number;
};

export const FirstPositionItem: React.FunctionComponent<Props> = (
  props: Props
) => (
  <RankPositionItem
    transactionsNumber={props.transactionsNumber}
    superCashbackAmount={props.superCashbackAmount}
    boxedLabel={"1"}
    rankingLabel={I18n.t("bonus.bpd.details.superCashback.rankLabel", {
      position: 1
    })}
  />
);
