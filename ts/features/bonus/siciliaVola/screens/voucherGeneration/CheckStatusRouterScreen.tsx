import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { constNull } from "fp-ts/lib/function";
import { Alert } from "react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherStart
} from "../../store/actions/voucherGeneration";
import {
  isAliveSelector,
  tosAcceptedSelector
} from "../../store/reducers/activation";
import GenericErrorComponent from "../../../../../components/screens/GenericErrorComponent";
import { svServiceAlive, svTosAccepted } from "../../store/actions/activation";
import { fold, isLoading, isReady } from "../../../bpd/model/RemoteValue";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import AcceptTosComponent from "../../components/AcceptTosComponent";
import CheckResidenceComponent from "../../components/CheckResidenceComponent";
import I18n from "../../../../../i18n";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const CheckStatusRouterScreen = (props: Props): React.ReactElement => {
  const { start, checkServiceAvailable, checkTosAccepted } = props;

  React.useEffect(() => {
    start();
    checkServiceAvailable();
    checkTosAccepted();
  }, [start, checkServiceAvailable, checkTosAccepted]);

  if (
    !isReady(props.isServiceAlive) ||
    (isReady(props.isServiceAlive) && !props.isServiceAlive.value)
  ) {
    return (
      <LoadingErrorComponent
        isLoading={isLoading(props.isServiceAlive)}
        loadingCaption={I18n.t("global.genericWaiting")}
        onRetry={props.checkServiceAvailable}
      />
    );
  }

  const handleTosCancel = () => {
    props.cancel();
  };

  const handleTosAccepted = () => {
    Alert.alert(
      I18n.t("bonus.sv.voucherGeneration.acceptTos.alert.title"),
      I18n.t("bonus.sv.voucherGeneration.acceptTos.alert.message"),
      [
        {
          text: I18n.t("bonus.sv.voucherGeneration.acceptTos.alert.buttons.ok"),
          style: "default",
          // TODO replace with the effective implementation
          onPress: constNull
        },
        {
          text: I18n.t("bonus.sv.voucherGeneration.acceptTos.alert.buttons.ko"),
          style: "default",
          onPress: handleTosCancel
        }
      ]
    );
  };
  const manageTosResponse = (tosAccepted: boolean): React.ReactElement =>
    tosAccepted ? (
      <CheckResidenceComponent />
    ) : (
      <AcceptTosComponent
        onAccept={handleTosAccepted}
        onCancel={handleTosCancel}
      />
    );

  return fold(
    props.tosAccepted,
    () => <GenericErrorComponent onRetry={props.checkTosAccepted} />,
    () => (
      <LoadingErrorComponent
        isLoading={true}
        loadingCaption={""}
        onRetry={props.checkTosAccepted}
      />
    ),
    v => manageTosResponse(v),
    _ => <GenericErrorComponent onRetry={props.checkTosAccepted} />
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  start: () => dispatch(svGenerateVoucherStart()),
  back: () => dispatch(svGenerateVoucherBack()),
  cancel: () => dispatch(svGenerateVoucherCancel()),
  checkServiceAvailable: () => dispatch(svServiceAlive.request()),
  checkTosAccepted: () => dispatch(svTosAccepted.request())
});
const mapStateToProps = (state: GlobalState) => ({
  isServiceAlive: isAliveSelector(state),
  tosAccepted: tosAcceptedSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckStatusRouterScreen);
