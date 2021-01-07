import { index } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Button } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { BPay } from "../../../../../../../definitions/pagopa/BPay";
import { Label } from "../../../../../../components/core/typography/Label";
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
  addBPayToWallet,
  walletAddBPayCancel,
  walletAddBPayCompleted
} from "../../store/actions";
import {
  onboardingBPayAddingResultSelector,
  onboardingBPayChosenPanSelector
} from "../../store/reducers/addingBPay";
import { onboardingBPayFoundAccountsSelector } from "../../store/reducers/foundBpay";
import LoadAddBPayComponent from "./LoadAddBPayComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

type NextAction = {
  index: number;
  skip: boolean;
};
/**
 * This screen is displayed when BPay are found and ready to be added in wallet
 * @constructor
 */
const AddBPayScreen: React.FunctionComponent<Props> = (props: Props) => {
  // next could be skip or not (a pan should be added)
  const [currentAction, setNextAction] = React.useState<NextAction>({
    index: 0,
    skip: false
  });

  const currentIndex = currentAction.index;

  React.useEffect(() => {
    // call onCompleted when the end of bpay pans has been reached
    // and the adding phase has been completed (or it was skipped step)
    if (
      currentIndex >= props.bPayAccounts.length &&
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
    if (currentIndex < props.bPayAccounts.length) {
      props.addBPay(props.bPayAccounts[currentIndex]);
    }
    nextPan(false);
  };

  const currentPan = index(currentIndex, [...props.bPayAccounts]);

  return props.loading || props.isAddingResultError ? (
    <LoadAddBPayComponent
      isLoading={!props.isAddingResultError}
      onCancel={props.onCancel}
      onRetry={() => fromNullable(props.selectedBPay).map(props.onRetry)}
    />
  ) : currentPan.isSome() ? (
    // TODO: Replace with Iterative add component
    <SafeAreaView>
      <Button onPress={handleOnContinue}>
        <Label>ContinueTMP</Label>
      </Button>
    </SafeAreaView>
  ) : null; // this should not happen
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addBPay: (bPay: BPay) => dispatch(addBPayToWallet.request(bPay)),
  onCompleted: () => dispatch(walletAddBPayCompleted()),
  onCancel: () => dispatch(walletAddBPayCancel()),
  onRetry: (bPay: BPay) => dispatch(addBPayToWallet.request(bPay))
});

const mapStateToProps = (state: GlobalState) => {
  const remoteBPay = onboardingBPayFoundAccountsSelector(state);
  const addingResult = onboardingBPayAddingResultSelector(state);
  const bPayAccounts = fromNullable(
    getValueOrElse(remoteBPay, undefined)
  ).getOrElse([]);
  return {
    isAddingReady: isReady(addingResult),
    loading: isLoading(addingResult),
    isAddingResultError: isError(addingResult),
    remoteBPay,
    selectedBPay: onboardingBPayChosenPanSelector(state),
    bPayAccounts,
    profile: pot.toUndefined(profileSelector(state))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddBPayScreen);
