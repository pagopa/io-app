import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../../store/reducers/types";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * No Satispay account found for the user
 * @constructor
 */
const SatispayKoNotFound: React.FunctionComponent<Props> = () => (
  <SafeAreaView>
    <H1>No Satispay account found for the user</H1>
  </SafeAreaView>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SatispayKoNotFound);
