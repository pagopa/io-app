import * as React from "react";
import { View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../components/core/typography/H1";
import { GlobalState } from "../../../../store/reducers/types";
import { PrivativePaymentMethod } from "../../../../types/pagopa";

type NavigationParams = Readonly<{
  cobadge: PrivativePaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

/**
 * Detail screen for a privative card
 * TODO: fill the screen
 * @constructor
 */
const PrivativeDetailScreen: React.FunctionComponent<Props> = _ => (
  <View>
    <H1>PRIVATIVE DETAILD SCREEN</H1>
  </View>
);
const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivativeDetailScreen);
