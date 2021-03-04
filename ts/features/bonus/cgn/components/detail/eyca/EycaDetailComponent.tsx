import * as React from "react";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../../store/reducers/types";
import { Dispatch } from "../../../../../../store/actions/types";
import { eycaDetailsInformationSelector } from "../../../store/reducers/eyca/details";
import { cgnEycaActivationRequest } from "../../../store/actions/eyca/activation";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import EycaStatusDetailsComponent from "./EycaStatusDetailsComponent";
import EycaPendingComponent from "./EycaPendingComponent";
import EycaErrorComponent from "./EycaErrorComponent";
import { useEycaInformationBottomSheet } from "./EycaInformationComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const EycaDetailComponent: React.FunctionComponent<Props> = (props: Props) => {
  const { present } = useEycaInformationBottomSheet();

  const openEycaBottomSheet = async () => {
    await present();
  };

  const renderComponentEycaStatus = (eyca: EycaCard) => {
    switch (eyca.status) {
      case "ACTIVATED":
      case "REVOKED":
      case "EXPIRED":
        return (
          <EycaStatusDetailsComponent
            eycaCard={eyca}
            openBottomSheet={openEycaBottomSheet}
          />
        );
      case "PENDING":
        return <EycaPendingComponent openBottomSheet={openEycaBottomSheet} />;
      default:
        return <></>;
    }
  };

  return fromNullable(props.eyca).fold(
    <EycaErrorComponent
      onRetry={props.requestEycaActivation}
      openBottomSheet={openEycaBottomSheet}
    />,
    renderComponentEycaStatus
  );
};

const mapStateToProps = (state: GlobalState) => ({
  eyca: eycaDetailsInformationSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestEycaActivation: () => dispatch(cgnEycaActivationRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EycaDetailComponent);
