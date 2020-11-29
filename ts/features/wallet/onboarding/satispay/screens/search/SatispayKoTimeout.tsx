import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../../store/reducers/types";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Timeout during the satispay account request
 * @constructor
 */
const SatispayKoTimeout: React.FunctionComponent<Props> = () => (
  <SafeAreaView>
    <H1>Timeout during the satispay account request</H1>
  </SafeAreaView>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SatispayKoTimeout);
