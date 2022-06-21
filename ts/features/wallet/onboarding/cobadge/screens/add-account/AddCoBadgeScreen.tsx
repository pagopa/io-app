import * as pot from "@pagopa/ts-commons/lib/pot";
import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { profileSelector } from "../../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  getValueOrElse,
  isError,
  isLoading,
  isReady
} from "../../../../../bonus/bpd/model/RemoteValue";
import {
  addCoBadgeToWallet,
  walletAddCoBadgeCancel,
  walletAddCoBadgeCompleted
} from "../../store/actions";
import {
  onboardingCobadgeAddingResultSelector,
  onboardingCobadgeChosenSelector
} from "../../store/reducers/addingCoBadge";
import { onboardingCoBadgeFoundSelector } from "../../store/reducers/foundCoBadge";
import AddCobadgeComponent from "./AddCobadgeComponent";
import LoadAddCoBadgeComponent from "./LoadAddCoBadgeComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

type NextAction = {
  index: number;
  skip: boolean;
};
/**
 * This screen is displayed when co-badge cards are found and ready to be added in wallet
 * @constructor
 */
const AddCoBadgeScreen = (props: Props): React.ReactElement | null => {
  // next could be skip or not (a pan should be added)
  const [currentAction, setNextAction] = React.useState<NextAction>({
    index: 0,
    skip: false
  });

  const { coBadgeList, isAddingReady, onCompleted } = props;

  const currentIndex = currentAction.index;

  React.useEffect(() => {
    // call onCompleted when the end of co-badge list has been reached
    // and the adding phase has been completed (or it was skipped step)
    if (
      currentIndex >= coBadgeList.length &&
      (currentAction.skip || isAddingReady)
    ) {
      onCompleted();
    }
  }, [currentAction, coBadgeList, isAddingReady, onCompleted, currentIndex]);

  const nextPan = (skip: boolean) => {
    const nextIndex = currentIndex + 1;
    setNextAction({ index: nextIndex, skip });
  };

  const handleOnContinue = () => {
    if (currentIndex < props.coBadgeList.length) {
      props.addCoBadge(props.coBadgeList[currentIndex]);
    }
    nextPan(false);
  };

  const currentPan = AR.lookup(currentIndex, [...props.coBadgeList]);

  return props.loading || props.isAddingResultError ? (
    <LoadAddCoBadgeComponent
      isLoading={!props.isAddingResultError}
      onCancel={props.onCancel}
      onRetry={() =>
        pipe(props.selectedCoBadge, O.fromNullable, O.map(props.onRetry))
      }
    />
  ) : O.isSome(currentPan) ? (
    <AddCobadgeComponent
      pan={currentPan.value}
      pansNumber={props.coBadgeList.length}
      currentIndex={currentIndex}
      handleContinue={handleOnContinue}
      handleSkip={() => nextPan(true)}
      contextualHelp={props.contextualHelp}
    />
  ) : null; // this should not happen
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addCoBadge: (coBadge: PaymentInstrument) =>
    dispatch(addCoBadgeToWallet.request(coBadge)),
  onCompleted: () => dispatch(walletAddCoBadgeCompleted()),
  onCancel: () => dispatch(walletAddCoBadgeCancel()),
  onRetry: (coBadge: PaymentInstrument) =>
    dispatch(addCoBadgeToWallet.request(coBadge))
});

const mapStateToProps = (state: GlobalState) => {
  const remoteCoBadge = onboardingCoBadgeFoundSelector(state);
  const addingResult = onboardingCobadgeAddingResultSelector(state);
  const coBadgeList: ReadonlyArray<PaymentInstrument> = pipe(
    getValueOrElse(remoteCoBadge, undefined),
    O.fromNullable,
    O.chainNullableK(response => response.payload?.paymentInstruments),
    O.getOrElseW(() => [])
  );
  return {
    isAddingReady: isReady(addingResult),
    loading: isLoading(addingResult),
    isAddingResultError: isError(addingResult),
    remoteCoBadge,
    selectedCoBadge: onboardingCobadgeChosenSelector(state),
    coBadgeList,
    profile: pot.toUndefined(profileSelector(state))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddCoBadgeScreen);
