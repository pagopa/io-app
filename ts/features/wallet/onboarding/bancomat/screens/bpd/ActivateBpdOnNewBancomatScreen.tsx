import * as React from "react";
import { connect } from "react-redux";
import { onboardingBancomatAddedPansSelector } from "../../store/reducers/addedPans";
import { GlobalState } from "../../../../../../store/reducers/types";
import ActivateBpdOnNewPaymentMethodScreen from "./ActivateBpdOnNewPaymentMethodScreen";
export type Props = ReturnType<typeof mapStateToProps>;

const ActivateBpdOnNewBancomatScreen: React.FC<Props> = (props: Props) => {
  const asd = props.newBancomat;
  console.log("asdasd");
  console.log(asd);
  return (
    <ActivateBpdOnNewPaymentMethodScreen paymentMethods={props.newBancomat} />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  newBancomat: onboardingBancomatAddedPansSelector(state)
});
export default connect(mapStateToProps)(ActivateBpdOnNewBancomatScreen);
