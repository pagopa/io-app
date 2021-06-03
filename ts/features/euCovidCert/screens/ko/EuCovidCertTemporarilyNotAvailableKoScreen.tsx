import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../components/core/typography/H1";
import { GlobalState } from "../../../../store/reducers/types";
import { BaseEuCovidCertificateLayout } from "../BaseEuCovidCertificateLayout";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const EuCovidCertTemporarilyNotAvailableKoScreen = (
  _: Props
): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertTemporarilyNotAvailableKoScreen"}
    content={<H1>TMPEuCovidCertTemporarilyNotAvailableKoScreen</H1>}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertTemporarilyNotAvailableKoScreen);
