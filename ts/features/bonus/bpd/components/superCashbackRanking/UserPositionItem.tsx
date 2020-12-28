import * as React from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { profileNameSelector } from "../../../../../store/reducers/profile";
import { formatNumberWithNoDigits } from "../../../../../utils/stringBuilder";
import I18n from "../../../../../i18n";
import RankPositionItem from "./RankPositionItem";

type Props = {
  transactionsNumber: number;
  superCashbackAmount: number;
  userPosition: number;
  hideBadge?: boolean;
} & ReturnType<typeof mapStateToProps>;

const UserPositionItem: React.FunctionComponent<Props> = (props: Props) => (
  <RankPositionItem
    transactionsNumber={props.transactionsNumber}
    superCashbackAmount={props.superCashbackAmount}
    currentUserPosition={true}
    boxedLabel={I18n.t("global.you")}
    rankingLabel={`${formatNumberWithNoDigits(props.userPosition)}º: ${
      props.currentUser
    }`}
    hideBadge={props.hideBadge}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  currentUser: profileNameSelector(state)
});

export default connect(mapStateToProps)(UserPositionItem);
