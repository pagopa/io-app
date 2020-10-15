import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { fromNullable } from "fp-ts/lib/Option";
import { index } from "fp-ts/lib/Array";
import { GlobalState } from "../../../../../../store/reducers/types";
import { profileSelector } from "../../../../../../store/reducers/profile";
import { onboardingBancomatFoundPansSelector } from "../../store/reducers/pans";
import {
  getValueOrElse,
  isError,
  isLoading,
  isReady
} from "../../../../../bonus/bpd/model/RemoteValue";
import {
  walletAddBancomatCancel,
  walletAddBancomatCompleted,
  walletAddSelectedBancomat
} from "../../store/actions";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";
import {
  onboardingBancomatAddingResultSelector,
  onboardingBancomatChosenPanSelector
} from "../../store/reducers/addingPans";
import AddBancomatComponent from "./AddBancomatComponent";
import LoadAddBancomatComponent from "./LoadAddBancomatComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type NextAction = {
  index: number;
  skip: boolean;
};
/**
 * This screen is displayed when Bancomat are found and ready to be added in wallet
 * @constructor
 */
const AddBancomatScreen: React.FunctionComponent<Props> = (props: Props) => {
  // next could be skip or not (a pan should be added)
  const [currentAction, setNextAction] = React.useState<NextAction>({
    index: 0,
    skip: false
  });

  const currentIndex = currentAction.index;

  React.useEffect(() => {
    // we raise onCompleted we end pans has been reached
    // and the adding phase has been completed (or it was skipped)
    if (
      currentIndex >= props.pans.length &&
      (currentAction.skip || props.isAddingReady)
    ) {
      props.onCompleted();
    }
  }, [currentAction, props.isAddingReady]);

  const nextPan = (skip: boolean) => {
    const nextIndex = currentIndex + 1;
    setNextAction({ index: nextIndex, skip });
  };

  const handleOnContinue = () => {
    if (currentIndex < props.pans.length) {
      props.addBancomat(props.pans[currentIndex]);
    }
    nextPan(false);
  };

  const currentPan = index(currentIndex, [...props.pans]);

  return props.loading || props.isAddingResultError ? (
    <LoadAddBancomatComponent
      isLoading={!props.isAddingResultError}
      onCancel={props.onCancel}
      onRetry={() => fromNullable(props.selectedPan).map(props.onRetry)}
    />
  ) : currentPan.isSome() ? (
    <AddBancomatComponent
      pan={currentPan.value}
      profile={props.profile}
      pansNumber={props.pans.length}
      currentIndex={currentIndex}
      handleContinue={handleOnContinue}
      handleSkip={() => nextPan(true)}
    />
  ) : null; // this should not happen
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addBancomat: (pan: PatchedCard) =>
    dispatch(walletAddSelectedBancomat.request(pan)),
  onCompleted: () => dispatch(walletAddBancomatCompleted()),
  onCancel: () => dispatch(walletAddBancomatCancel()),
  onRetry: (panSelected: PatchedCard) =>
    dispatch(walletAddSelectedBancomat.request(panSelected))
});

const mapStateToProps = (state: GlobalState) => {
  const remotePans = onboardingBancomatFoundPansSelector(state);
  const addingResult = onboardingBancomatAddingResultSelector(state);
  return {
    isAddingReady: isReady(addingResult),
    loading: isLoading(addingResult),
    isAddingResultError: isError(addingResult),
    remotePans,
    selectedPan: onboardingBancomatChosenPanSelector(state),
    pans: getValueOrElse(remotePans, []),
    profile: pot.toUndefined(profileSelector(state))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddBancomatScreen);
