import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import React from "react";
import { View } from "react-native";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { GlobalState } from "../../../../store/reducers/types";
import { idPayWalletInitiativeListSelector } from "../store/reducers";
import IDPayCardPreviewComponent from "./IDPayCardPreviewComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const IDPayCardsList = (props: Props) => (
  <View>
    {pot.isSome(props.initiativeList) &&
      props.initiativeList.value.map(initiative => (
        <IDPayCardPreviewComponent
          key={initiative.initiativeId}
          initiativeId={initiative.initiativeId}
          initiativeName={initiative.initiativeName}
          endDate={initiative.endDate}
          availableAmount={initiative.available}
        />
      ))}
  </View>
);

const IDPayCardsListMemo = React.memo(
  IDPayCardsList,
  (prev: Props, curr: Props) =>
    pot.isSome(prev.initiativeList) &&
    pot.isSome(curr.initiativeList) &&
    _.isEqual(curr.initiativeList.value, prev.initiativeList.value)
);

const IDPayCardsInWalletContainer = (props: Props) => (
  <IDPayCardsListMemo {...props} />
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  initiativeList: idPayWalletInitiativeListSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IDPayCardsInWalletContainer);
