import { fromNullable, isSome } from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import {
  fold,
  getValueOrElse,
  isReady
} from "../../../../../bonus/bpd/model/RemoteValue";
import {
  addPrivativeToWallet,
  walletAddPrivativeCancel,
  walletAddPrivativeCompleted,
  walletAddPrivativeFailure
} from "../../store/actions";
import { onboardingPrivativeAddingResultSelector } from "../../store/reducers/addingPrivative";
import { onboardingPrivativeFoundSelector } from "../../store/reducers/foundPrivative";
import AddPrivativeCardComponent from "./AddPrivativeCardComponent";
import LoadAddPrivativeCard from "./LoadAddPrivativeCard";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const UnexpectedValueFailure = (props: Props) => {
  props.failure("foundPrivative is not some in AddPrivativeCardScreen");
  return null;
};

/**
 * This screen shows the user the private card found and allows him to add it to the wallet
 * @param props
 * @constructor
 */
const AddPrivativeCardScreen = (props: Props): React.ReactElement | null => {
  const { addingResult, complete } = props;
  useEffect(() => {
    if (isReady(addingResult)) {
      complete();
    }
  }, [addingResult, complete]);

  const addToWallet = () => props.foundPrivative.map(p => props.addToWallet(p));
  const loadErrorAddPrivativeCard = (isLoading: boolean) => (
    <LoadAddPrivativeCard
      isLoading={isLoading}
      onCancel={props.cancel}
      onRetry={addToWallet}
      testID={"loadErrorAddPrivativeCard"}
    />
  );

  return fold(
    props.addingResult,
    () =>
      isSome(props.foundPrivative) ? (
        <AddPrivativeCardComponent
          paymentInstrument={props.foundPrivative.value}
          handleSkip={props.cancel}
          handleContinue={addToWallet}
          contextualHelp={emptyContextualHelp}
        />
      ) : (
        <UnexpectedValueFailure {...props} />
      ),
    () => loadErrorAddPrivativeCard(true),
    _ => null,
    _ => loadErrorAddPrivativeCard(false)
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  failure: (reason: string) => dispatch(walletAddPrivativeFailure(reason)),
  addToWallet: (pi: PaymentInstrument) =>
    dispatch(addPrivativeToWallet.request(pi)),
  complete: () => dispatch(walletAddPrivativeCompleted())
});

const mapStateToProps = (state: GlobalState) => ({
  foundPrivative: fromNullable(
    getValueOrElse(onboardingPrivativeFoundSelector(state), undefined)
  ).mapNullable(response => response.paymentInstrument),
  addingResult: onboardingPrivativeAddingResultSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPrivativeCardScreen);
