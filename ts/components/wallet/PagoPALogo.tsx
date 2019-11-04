/**
 * Render the pagoPA Logo according to the environment (Test or Production)
 */
import * as React from "react";
import { Image } from "react-native";
import { connect } from "react-redux";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";

type Props = ReturnType<typeof mapStateToProps>;

class PagoPALogo extends React.Component<Props> {
  public render(): React.ReactNode {
    const { isPagoPATestEnabled } = this.props;
    return isPagoPATestEnabled ? (
      <Image
        style={{ resizeMode: "contain", width: 60 }}
        source={require("../../../img/wallet/logo-pagopa-test.png")}
      />
    ) : (
      <Image
        style={{ resizeMode: "contain", width: 40 }}
        source={require("../../../img/wallet/logo-pagopa.png")}
      />
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state)
});

export default connect(mapStateToProps)(PagoPALogo);
