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
  addBancomatToWallet
} from "../../store/actions";
import {
  onboardingBancomatAddingResultSelector,
  onboardingBancomatChosenPanSelector
} from "../../store/reducers/addingPans";
import { Card } from "../../../../../../../definitions/pagopa/walletv2/Card";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import AddBancomatComponent from "./AddBancomatComponent";
import LoadAddBancomatComponent from "./LoadAddBancomatComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

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
  const { isAddingReady, onCompleted, cards } = props;

  const currentIndex = currentAction.index;

  React.useEffect(() => {
    // call onCompleted when the end of pans has been reached
    // and the adding phase has been completed (or it was skipped step)
    if (currentIndex >= cards.length && (currentAction.skip || isAddingReady)) {
      onCompleted();
    }
  }, [currentAction, isAddingReady, cards, onCompleted, currentIndex]);

  const nextPan = (skip: boolean) => {
    const nextIndex = currentIndex + 1;
    setNextAction({ index: nextIndex, skip });
  };

  const handleOnContinue = () => {
    if (currentIndex < props.cards.length) {
      props.addBancomat(props.cards[currentIndex]);
    }
    nextPan(false);
  };

  const currentPan = index(currentIndex, [...props.cards]);

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
      pansNumber={props.cards.length}
      currentIndex={currentIndex}
      handleContinue={handleOnContinue}
      handleSkip={() => nextPan(true)}
      contextualHelp={props.contextualHelp}
    />
  ) : null; // this should not happen
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addBancomat: (pan: Card) => dispatch(addBancomatToWallet.request(pan)),
  onCompleted: () => dispatch(walletAddBancomatCompleted()),
  onCancel: () => dispatch(walletAddBancomatCancel()),
  onRetry: (panSelected: Card) =>
    dispatch(addBancomatToWallet.request(panSelected))
});

const mapStateToProps = (state: GlobalState) => {
  const remotePans = onboardingBancomatFoundPansSelector(state);
  const addingResult = onboardingBancomatAddingResultSelector(state);
  const cards = fromNullable(getValueOrElse(remotePans, undefined))
    .map(p => p.cards)
    .getOrElse([]);
  return {
    isAddingReady: isReady(addingResult),
    loading: isLoading(addingResult),
    isAddingResultError: isError(addingResult),
    remotePans,
    selectedPan: onboardingBancomatChosenPanSelector(state),
    cards,
    profile: pot.toUndefined(profileSelector(state))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddBancomatScreen);
