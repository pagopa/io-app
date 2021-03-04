import { Millisecond } from "italia-ts-commons/lib/units";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { navigateToCgnDetails } from "../navigation/actions";
import { isCgnInformationAvailableSelector } from "../store/reducers/details";
import { cgnDetails } from "../store/actions/details";
import { useActionOnFocus } from "../../../../utils/hooks/useOnFocus";
import { GlobalState } from "../../../../store/reducers/types";
import { H5 } from "../../../../components/core/typography/H5";
import { IOColors } from "../../../../components/core/variables/IOColors";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const CgnCardList = (props: Props) => (
  <View>
    {
      // TODO Replace component with folded card when available
      props.isCgnActive && (
        <ButtonDefaultOpacity
          color={IOColors.blue}
          onPress={props.navigateToCgnDetailScreen}
          style={{ width: "100%" }}
        >
          <H5 color={"white"}>{"GO TO CGN DETAIL"}</H5>
        </ButtonDefaultOpacity>
      )
    }
  </View>
);

const CgnCardListMemo = React.memo(
  CgnCardList,
  (prev: Props, curr: Props) => prev.isCgnActive === curr.isCgnActive
);

// Automatically refresh when focused every 5 minutes (the remote data can change every 4 h)
const refreshTime = 300000 as Millisecond;

/**
 * Render the cgn card in the wallet
 * @constructor
 */
const CgnCardInWalletContainer = (props: Props) => {
  // If the user does "pull to refresh", this timer is ignored and the refresh is forced
  useActionOnFocus(props.load, refreshTime);
  return <CgnCardListMemo {...props} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => dispatch(cgnDetails.request()),
  navigateToCgnDetailScreen: () => dispatch(navigateToCgnDetails())
});

const mapStateToProps = (state: GlobalState) => ({
  isCgnActive: isCgnInformationAvailableSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnCardInWalletContainer);
