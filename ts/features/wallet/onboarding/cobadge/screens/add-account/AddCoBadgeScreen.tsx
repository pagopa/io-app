import { index } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Button } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../components/core/typography/H1";
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
  CoBadgeResponse,
  walletAddCoBadgeCancel,
  walletAddCoBadgeCompleted
} from "../../store/actions";
import {
  onboardingCobadgeAddingResultSelector,
  onboardingCobadgeChosenPanSelector
} from "../../store/reducers/addingCoBadge";
import { onboardingCoBadgeFoundSelector } from "../../store/reducers/foundCoBadge";
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

  const currentIndex = currentAction.index;

  React.useEffect(() => {
    // call onCompleted when the end of co-badge list has been reached
    // and the adding phase has been completed (or it was skipped step)
    if (
      currentIndex >= props.coBadgeList.length &&
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
    if (currentIndex < props.coBadgeList.length) {
      props.addCoBadge(props.coBadgeList[currentIndex]);
    }
    nextPan(false);
  };

  const currentPan = index(currentIndex, [...props.coBadgeList]);

  return props.loading || props.isAddingResultError ? (
    <LoadAddCoBadgeComponent
      isLoading={!props.isAddingResultError}
      onCancel={props.onCancel}
      onRetry={() => fromNullable(props.selectedCoBadge).map(props.onRetry)}
    />
  ) : currentPan.isSome() ? (
    // TODO replace with iterative component
    <SafeAreaView>
      <Button onPress={handleOnContinue}>
        <H1>TMP Add</H1>
      </Button>
    </SafeAreaView>
  ) : null; // this should not happen
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addCoBadge: (coBadge: CoBadgeResponse) =>
    dispatch(addCoBadgeToWallet.request(coBadge)),
  onCompleted: () => dispatch(walletAddCoBadgeCompleted()),
  onCancel: () => dispatch(walletAddCoBadgeCancel()),
  onRetry: (coBadge: CoBadgeResponse) =>
    dispatch(addCoBadgeToWallet.request(coBadge))
});

const mapStateToProps = (state: GlobalState) => {
  const remoteCoBadge = onboardingCoBadgeFoundSelector(state);
  const addingResult = onboardingCobadgeAddingResultSelector(state);
  const coBadgeList = getValueOrElse(remoteCoBadge, []);
  return {
    isAddingReady: isReady(addingResult),
    loading: isLoading(addingResult),
    isAddingResultError: isError(addingResult),
    remoteCoBadge,
    selectedCoBadge: onboardingCobadgeChosenPanSelector(state),
    coBadgeList,
    profile: pot.toUndefined(profileSelector(state))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddCoBadgeScreen);
