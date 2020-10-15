import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { profileSelector } from "../../../../../../store/reducers/profile";
import { onboardingBancomatFoundPansSelector } from "../../store/reducers/pans";
import {
  getValueOrElse,
  isLoading
} from "../../../../../bonus/bpd/model/RemoteValue";
import {
  walletAddBancomatCompleted,
  walletAddSelectedBancomat
} from "../../store/actions";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";
import AddBancomatComponent from "./AddBancomatComponent";
import LoadAddBancomatComponent from "./LoadAddBancomatComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * This screen is displayed when Bancomat are found and ready to be added in wallet
 * @constructor
 */
const AddBancomatScreen: React.FunctionComponent<Props> = (props: Props) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextPan = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= props.pans.length) {
      props.onContinue();
      return;
    }
    setCurrentIndex(nextIndex);
  };

  const handleOnContinue = () => {
    props.addBancomat(props.pans[currentIndex]);
    nextPan();
  };

  return props.loading || props.pans.length === 0 ? (
    <LoadAddBancomatComponent isLoading={props.loading} />
  ) : (
    <AddBancomatComponent
      pan={props.pans[currentIndex]}
      profile={props.profile}
      pansNumber={props.pans.length}
      currentIndex={currentIndex}
      handleContinue={handleOnContinue}
      handleSkip={nextPan}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addBancomat: (pan: PatchedCard) =>
    dispatch(walletAddSelectedBancomat.request(pan)),
  onContinue: () => dispatch(walletAddBancomatCompleted())
});

const mapStateToProps = (state: GlobalState) => {
  const remotePans = onboardingBancomatFoundPansSelector(state);
  return {
    loading: isLoading(remotePans),
    remotePans,
    pans: getValueOrElse(remotePans, []),
    profile: pot.toUndefined(profileSelector(state))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddBancomatScreen);
