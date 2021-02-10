import * as React from "react";
import { connect } from "react-redux";
import { View } from "native-base";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { H1 } from "../../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a CGN activation
 * but is not eligible for its activation
 */
const CgnActivationIneligibleScreen = (_: Props): React.ReactElement => (
  // PLACEHOLDER for request INELIGIBLE screen
  <BaseScreenComponent>
    <View>
      <H1>{"You're not eligible to CGN activation"}</H1>
    </View>
  </BaseScreenComponent>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnActivationIneligibleScreen);
