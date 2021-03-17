import * as React from "react";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { useEffect } from "react";
import { GlobalState } from "../../../../../../store/reducers/types";
import { Dispatch } from "../../../../../../store/actions/types";
import { eycaInformationSelector } from "../../../store/reducers/eyca/details";
import { cgnEycaActivation } from "../../../store/actions/eyca/activation";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import { cgnEycaActivationStatus } from "../../../store/reducers/eyca/activation";
import { CardPending } from "../../../../../../../definitions/cgn/CardPending";
import EycaStatusDetailsComponent from "./EycaStatusDetailsComponent";
import EycaPendingComponent from "./EycaPendingComponent";
import EycaErrorComponent from "./EycaErrorComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const EycaDetailComponent: React.FunctionComponent<Props> = (props: Props) => {
  useEffect(() => {
    if (CardPending.is(props.eyca)) {
    }
  }, [props.eyca]);

  const renderComponentEycaStatus = (eyca: EycaCard) => {
    switch (eyca.status) {
      case "ACTIVATED":
      case "REVOKED":
      case "EXPIRED":
        return <EycaStatusDetailsComponent eycaCard={eyca} />;
      case "PENDING":
        return <EycaPendingComponent />;
      default:
        return <></>;
    }
  };

  return fromNullable(props.eyca).fold(
    <EycaErrorComponent onRetry={props.requestEycaActivation} />,
    renderComponentEycaStatus
  );
};

const mapStateToProps = (state: GlobalState) => ({
  eyca: eycaInformationSelector(state),
  eycaActivationStatus: cgnEycaActivationStatus(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestEycaActivation: () => dispatch(cgnEycaActivation.request())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EycaDetailComponent);
