import React from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../store/reducers/types";
import { isUpdatedNeededPagoPa } from "../../utils/appVersion";
import RemindUpdatePagoPaVersionOverlay from "../RemindUpdatePagoPaVersionOverlay";
import { LightModalContextInterface } from "../ui/LightModal";
import { withConditionalView } from "./withConditionalView";
import { withLightModalContext } from "./withLightModalContext";

export type ModalProps = LightModalContextInterface &
  ReturnType<typeof mapStateToProps>;

class ModalControlMinPagoPaAppVersioOverlay extends React.Component<
  ModalProps
> {
  public componentWillUnmount() {
    this.hideModal();
  }

  private hideModal = () => {
    this.props.hideModal();
  };
  public render() {
    return <RemindUpdatePagoPaVersionOverlay />;
  }
}

const ConditionalView = withLightModalContext(
  ModalControlMinPagoPaAppVersioOverlay
);

export type Props = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: GlobalState) => {
  const minPagoPaAppVersionValidated =
    state.backendInfo.serverInfo === undefined
      ? true
      : !isUpdatedNeededPagoPa(state.backendInfo.serverInfo);
  return {
    isMinPagoPaAppVersionValidated: minPagoPaAppVersionValidated
  };
};

export function withValidatedPagoPaVersion<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return connect(
    mapStateToProps,
    undefined
  )(
    withConditionalView(
      WrappedComponent,
      (props: Props) => props.isMinPagoPaAppVersionValidated,
      ConditionalView
    )
  );
}
