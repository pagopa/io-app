import * as React from "react";
import { connect } from "react-redux";
import { View } from "native-base";
import { GlobalState } from "../../../../store/reducers/types";
import { Dispatch } from "../../../../store/actions/types";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (_: Props): React.ReactElement => (
  // TODO PLACEHOLDER for CGN detail screen
  <BaseScreenComponent>
    <View>
      <H1>{"CGN DETAIL"}</H1>
    </View>
  </BaseScreenComponent>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);
