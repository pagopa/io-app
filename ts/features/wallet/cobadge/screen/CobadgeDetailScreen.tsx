import { Text, View } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";

type NavigationParams = Readonly<{
  cobadge: CreditCardPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

/**
 * Detail screen for a cobadge card
 * @constructor
 */
const CobadgeDetailScreen: React.FunctionComponent<Props> = _ => (
  <View>
    <Text>{"Entra"}</Text>
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CobadgeDetailScreen);
