import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { navigateBack } from "../../../../../../store/actions/navigation";
import { profileSelector } from "../../../../../../store/reducers/profile";
import { onboardingBancomatFoundPansSelector } from "../../store/reducers/pans";
import { isReady } from "../../../../../bonus/bpd/model/RemoteValue";
import {
  onboardingBancomatChosenPanError,
  onboardingBancomatChosenPanLoading
} from "../../store/reducers/addingPans";
import { walletAddSelectedBancomat } from "../../store/actions";
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

  React.useEffect(() => {
    // If we reached the last pan of our list exit the flow and complete the saga
    if (currentIndex === props.pans.length - 1 && !props.loading) {
      props.onContinue();
    }
  }, [props.loading, currentIndex]);

  const skipToNextPan = () => setCurrentIndex(currentIndex + 1);

  const handleOnContinue = () => {
    props.addBancomat(props.pans[currentIndex]);
    skipToNextPan();
  };

  return props.loading ? (
    <LoadAddBancomatComponent />
  ) : (
    <AddBancomatComponent
      pan={props.pans[currentIndex]}
      profile={props.profile}
      pansNumber={props.pans.length}
      currentIndex={currentIndex}
      handleContinue={handleOnContinue}
      handleSkip={skipToNextPan}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(navigateBack()),
  addBancomat: (pan: PatchedCard) =>
    dispatch(walletAddSelectedBancomat.request(pan)),
  onContinue: () => null
});

const mapStateToProps = (state: GlobalState) => {
  const maybeFoundPans = onboardingBancomatFoundPansSelector(state);
  return {
    loading:
      onboardingBancomatChosenPanError(state) ||
      onboardingBancomatChosenPanLoading(state),
    pans: isReady(maybeFoundPans) ? maybeFoundPans.value : [],
    profile: pot.toUndefined(profileSelector(state))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddBancomatScreen);
