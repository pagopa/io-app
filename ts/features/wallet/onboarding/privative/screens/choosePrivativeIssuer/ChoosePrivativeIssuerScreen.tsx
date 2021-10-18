import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { loadPrivativeIssuers } from "../../store/actions";
import { privativeIssuersListSelector } from "../../store/reducers/privativeIssuers";
import ChoosePrivativeIssuerComponent from "./ChoosePrivativeIssuerComponent";
import LoadChoosePrivativeIssuer from "./LoadChoosePrivativeIssuer";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
/**
 * The user will choose a brand between a list of available brands
 * This screen handles also the loading and error of the brands configuration
 * @param props
 * @constructor
 */
const ChoosePrivativeIssuerScreen = (props: Props): React.ReactElement => {
  const { loadPrivativeIssuers } = props;
  useEffect(() => {
    loadPrivativeIssuers();
  }, [loadPrivativeIssuers]);

  if (props.privativeIssuers.kind !== "PotSome") {
    return <LoadChoosePrivativeIssuer />;
  }

  return (
    <ChoosePrivativeIssuerComponent
      privativeIssuers={props.privativeIssuers.value}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadPrivativeIssuers: () => dispatch(loadPrivativeIssuers.request())
});

const mapStateToProps = (state: GlobalState) => ({
  privativeIssuers: privativeIssuersListSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChoosePrivativeIssuerScreen);
