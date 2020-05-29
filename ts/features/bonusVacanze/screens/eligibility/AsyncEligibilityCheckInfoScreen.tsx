import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { navigateToWalletHome } from "../../../../store/actions/navigation";
import { InfoScreenComponent } from "../../components/InfoScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const title = "Riceverai notizie";
const body = "bla bla lba";
const image = require("../../../../../img/wallet/errors/invalid-amount-icon.png");

/**
 * This screen informs the user that the request takes longer than necessary to be completed
 * and will receive a notification with the outcome of the verification when it is terminated.
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const AsyncEligibilityCheckInfoScreen: React.FunctionComponent<
  Props
> = props => {
  return (
    <InfoScreenComponent
      navigationTitle={title}
      onConfirm={props.onConfirm}
      image={image}
      body={body}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO: link with the right dispatch action
  onConfirm: () => dispatch(navigateToWalletHome())
});

export default connect(
  null,
  mapDispatchToProps
)(AsyncEligibilityCheckInfoScreen);
