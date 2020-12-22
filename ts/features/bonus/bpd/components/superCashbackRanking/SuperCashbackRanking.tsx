import * as React from "react";
import { connect } from "react-redux";
import { View } from "native-base";
import { fromNullable } from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import { H3 } from "../../../../../components/core/typography/H3";
import I18n from "../../../../../i18n";
import Markdown from "../../../../../components/ui/Markdown";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { BpdPeriodWithInfo } from "../../store/reducers/details/periods";
import { localeDateFormat } from "../../../../../utils/locale";
import { FirstPositionItem } from "./FirstPositionItem";
import { LastPositionItem } from "./LastPositionItem";
import UserPositionItem from "./UserPositionItem";

type Props = ReturnType<typeof mapStateToProps>;

type tmpCitizenRankingResource = {
  totalParticipants: number;
  ranking: number;
  // Numero massimo di transazioni effettuate dagli utenti che rientrano nel 'rimborso speciale'
  maxTransactionNumber: number;
  // Numero minimo di transazioni effettuate dagli utenti che rientrano nel 'rimborso speciale'
  minTransactionNumber: number;
  transactionNumber: number;
  awardPeriodId: number;
};

const RankingItems: React.FunctionComponent<Props> = (props: Props) => {
  if (props.selectedPeriod) {
    if (props.selectedPeriod.minPosition < props.rankingInformation.ranking) {
      return (
        <>
          <FirstPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.maxTransactionNumber}
          />
          <LastPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.minTransactionNumber}
            lastAvailablePosition={props.selectedPeriod.minPosition}
          />
          <UserPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.transactionNumber}
            hideBadge={true}
            userPosition={props.rankingInformation.ranking}
          />
        </>
      );
    } else if (
      props.rankingInformation.ranking === props.selectedPeriod.minPosition
    ) {
      return (
        <>
          <FirstPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.maxTransactionNumber}
          />
          <UserPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.transactionNumber}
            userPosition={props.rankingInformation.ranking}
          />
        </>
      );
    } else if (
      props.rankingInformation.ranking < props.selectedPeriod.minPosition &&
      props.rankingInformation.ranking > 1
    ) {
      return (
        <>
          <FirstPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.maxTransactionNumber}
          />
          <UserPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.transactionNumber}
            userPosition={props.rankingInformation.ranking}
          />
          <LastPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.minTransactionNumber}
            lastAvailablePosition={props.selectedPeriod.minPosition}
          />
        </>
      );
    } else {
      return (
        <>
          <UserPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.transactionNumber}
            userPosition={props.rankingInformation.ranking}
          />
          <LastPositionItem
            superCashbackAmount={props.selectedPeriod.superCashbackAmount}
            transactionsNumber={props.rankingInformation.minTransactionNumber}
            lastAvailablePosition={props.selectedPeriod.minPosition}
          />
        </>
      );
    }
  }

  return <View />;
};

const CSS_STYLE = `
body {
  color: ${IOColors.bluegreyDark}
}
`;

const calculateEndDate = (selectedPeriod: BpdPeriodWithInfo | undefined) =>
  fromNullable(selectedPeriod).fold("", p => {
    const endDate = new Date(p.endDate.getTime());
    endDate.setDate(endDate.getDate() + p.gracePeriod);

    return localeDateFormat(endDate, I18n.t("global.dateFormats.shortFormat"));
  });

const SuperCashbackRanking: React.FunctionComponent<Props> = (props: Props) => (
  <>
    <View spacer={true} />
    <RankingItems {...props} />
    <View spacer={true} small />
    <ItemSeparatorComponent noPadded={true} />
    <View spacer={true} />
    <H3>{I18n.t("bonus.bpd.details.superCashback.howItWorks.title")}</H3>
    <View spacer={true} />
    <Markdown cssStyle={CSS_STYLE}>
      {I18n.t("bonus.bpd.details.superCashback.howItWorks.body", {
        endDate: calculateEndDate(props.selectedPeriod)
      })}
    </Markdown>
  </>
);

const mapStateToProps = (state: GlobalState) => {
  const rankingInformation: tmpCitizenRankingResource = {
    totalParticipants: 1000000,
    ranking: 21,
    maxTransactionNumber: 80,
    minTransactionNumber: 50,
    transactionNumber: 30,
    awardPeriodId: 1
  };

  return {
    rankingInformation,
    selectedPeriod: bpdSelectedPeriodSelector(state)
  };
};

export default connect(mapStateToProps)(SuperCashbackRanking);
