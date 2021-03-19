import * as React from "react";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { GlobalState } from "../../../../../../store/reducers/types";
import { Dispatch } from "../../../../../../store/actions/types";
import {
  eycaCardSelector,
  isEycaDetailsLoading
} from "../../../store/reducers/eyca/details";
import {
  cgnEycaActivation,
  cgnEycaActivationStatusRequest
} from "../../../store/actions/eyca/activation";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import {
  cgnEycaActivationLoading,
  cgnEycaActivationStatus
} from "../../../store/reducers/eyca/activation";
import { CardPending } from "../../../../../../../definitions/cgn/CardPending";
import EycaStatusDetailsComponent from "./EycaStatusDetailsComponent";
import EycaPendingComponent from "./EycaPendingComponent";
import EycaErrorComponent from "./EycaErrorComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// This component is used to handle the rendering conditions of the three possible EYCA states for the user
// ERROR => EycaErrorComponent
// FOUND and PENDING => First we check the BE orchestrator status than shows EycaPendingComponent if card is pending and
//                      orchestrator is not in an error state, unless we will show EycaErrorComponent
// FOUND and detailed => EycaStatusDetailsComponent
const EycaDetailComponent = (props: Props) => {
  useEffect(() => {
    if (CardPending.is(props.eyca)) {
      props.getEycaActivationStatus();
    }
  }, [props.eyca]);

  const errorComponent = (
    <EycaErrorComponent onRetry={props.requestEycaActivation} />
  );

  const renderComponentEycaStatus = (eyca: EycaCard): React.ReactNode => {
    switch (eyca.status) {
      case "ACTIVATED":
      case "REVOKED":
      case "EXPIRED":
        return <EycaStatusDetailsComponent eycaCard={eyca} />;
      case "PENDING":
        return fromNullable(props.eycaActivationStatus).fold(
          errorComponent,
          as => (as === "ERROR" ? errorComponent : <EycaPendingComponent />)
        );
      default:
        return null;
    }
  };

  return (
    <>
      {props.isLoading ? (
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
        />
      ) : (
        fromNullable(props.eyca).fold(errorComponent, renderComponentEycaStatus)
      )}
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  eyca: eycaCardSelector(state),
  eycaActivationStatus: cgnEycaActivationStatus(state),
  isLoading: isEycaDetailsLoading(state) || cgnEycaActivationLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestEycaActivation: () => dispatch(cgnEycaActivation.request()),
  getEycaActivationStatus: () => dispatch(cgnEycaActivationStatusRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EycaDetailComponent);
