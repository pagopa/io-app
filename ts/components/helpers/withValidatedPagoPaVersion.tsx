import React from "react";
import { connect } from "react-redux";
import { isPagoPaSupportedSelector } from "../../common/versionInfo/store/reducers/versionInfo";
import { GlobalState } from "../../store/reducers/types";
import RemindUpdatePagoPaVersionOverlay from "../RemindUpdatePagoPaVersionOverlay";
import BaseScreenComponent from "../screens/BaseScreenComponent";
import { LightModalContextInterface } from "../ui/LightModal";
import { withConditionalView } from "./withConditionalView";
import { withLightModalContext } from "./withLightModalContext";

export type ModalProps = LightModalContextInterface &
  ReturnType<typeof mapStateToProps>;

class ModalControlMinPagoPaAppVersionOverlay extends React.Component<ModalProps> {
  public componentWillUnmount() {
    this.hideModal();
  }

  private hideModal = () => {
    this.props.hideModal();
  };
  public render() {
    return (
      <BaseScreenComponent appLogo={true}>
        <RemindUpdatePagoPaVersionOverlay />
      </BaseScreenComponent>
    );
  }
}

const ConditionalView = withLightModalContext(
  ModalControlMinPagoPaAppVersionOverlay
);

export type Props = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: GlobalState) => ({
  isPagoPaVersionSupported: isPagoPaSupportedSelector(state)
});

export function withValidatedPagoPaVersion<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return connect(mapStateToProps)(
    withConditionalView(
      WrappedComponent,
      (props: Props) => props.isPagoPaVersionSupported,
      ConditionalView
    )
  );
}
