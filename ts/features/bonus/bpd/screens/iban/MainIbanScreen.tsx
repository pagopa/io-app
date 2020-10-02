import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { isError, isLoading, isReady } from "../../model/RemoteValue";
import { IbanStatus } from "../../saga/networking/patchCitizenIban";
import {
  bpdIbanInsertionContinue,
  bpdIbanInsertionResetScreen
} from "../../store/actions/iban";
import { bpdUpsertIbanSelector } from "../../store/reducers/details/activation/payoffInstrument";
import IbanKoCannotVerify from "./IbanKOCannotVerify";
import IbanKoNotOwned from "./IbanKONotOwned";
import IbanKOWrong from "./IbanKOWrong";
import IbanLoadingUpsert from "./IbanLoadingUpsert";
import IbanInsertionScreen from "./insertion/IbanInsertionScreen";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const chooseRenderScreen = (props: Props) => {
  const ibanStatus = props.upsertValue.outcome;
  if (isLoading(ibanStatus) || isError(ibanStatus)) {
    return <IbanLoadingUpsert />;
  } else if (isReady(ibanStatus)) {
    switch (ibanStatus.value) {
      case IbanStatus.CANT_VERIFY:
        return <IbanKoCannotVerify />;
      case IbanStatus.NOT_OWNED:
        return <IbanKoNotOwned />;
      case IbanStatus.NOT_VALID:
        return <IbanKOWrong />;
      case IbanStatus.OK:
        props.reset();
        props.completed();
    }
  }
  return <IbanInsertionScreen />;
};

const MainIbanScreen: React.FunctionComponent<Props> = props => {
  useEffect(() => {
    props.reset();
  }, []);
  return chooseRenderScreen(props);
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reset: () => dispatch(bpdIbanInsertionResetScreen()),
  completed: () => dispatch(bpdIbanInsertionContinue())
});

const mapStateToProps = (state: GlobalState) => ({
  upsertValue: bpdUpsertIbanSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(MainIbanScreen);
