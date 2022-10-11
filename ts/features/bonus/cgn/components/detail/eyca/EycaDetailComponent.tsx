import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { connect } from "react-redux";
import { CardPending } from "../../../../../../../definitions/cgn/CardPending";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import { Dispatch } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { isLoading } from "../../../../bpd/model/RemoteValue";
import {
  cgnEycaActivation,
  cgnEycaActivationStatusRequest
} from "../../../store/actions/eyca/activation";
import {
  cgnEycaActivationLoading,
  cgnEycaActivationStatus
} from "../../../store/reducers/eyca/activation";
import {
  eycaCardSelector,
  eycaDetailSelector
} from "../../../store/reducers/eyca/details";
import EycaErrorComponent from "./EycaErrorComponent";
import { useEycaInformationBottomSheet } from "./EycaInformationComponent";
import EycaPendingComponent from "./EycaPendingComponent";
import EycaStatusDetailsComponent from "./EycaStatusDetailsComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const EycaDetailComponent = (props: Props) => {
  const { present, bottomSheet } = useEycaInformationBottomSheet();

  const { eyca, getEycaActivationStatus } = props;

  useEffect(() => {
    if (CardPending.is(eyca)) {
      getEycaActivationStatus();
    }
  }, [eyca, getEycaActivationStatus]);

  const errorComponent = (
    <EycaErrorComponent
      onRetry={props.requestEycaActivation}
      openBottomSheet={present}
    />
  );

  const renderComponentEycaStatus = (eyca: EycaCard): React.ReactNode => {
    switch (eyca.status) {
      case "ACTIVATED":
      case "REVOKED":
      case "EXPIRED":
        return (
          <EycaStatusDetailsComponent
            eycaCard={eyca}
            openBottomSheet={present}
          />
        );
      case "PENDING":
        return pipe(
          props.eycaActivationStatus,
          O.fromNullable,
          O.fold(
            () => errorComponent,
            as =>
              as === "ERROR" || as === "NOT_FOUND" ? (
                errorComponent
              ) : (
                <EycaPendingComponent openBottomSheet={present} />
              )
          )
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
        pipe(
          props.eyca,
          O.fromNullable,
          O.fold(() => errorComponent, renderComponentEycaStatus)
        )
      )}
      {bottomSheet}
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  eyca: eycaCardSelector(state),
  eycaActivationStatus: cgnEycaActivationStatus(state),
  isLoading:
    isLoading(eycaDetailSelector(state)) || cgnEycaActivationLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestEycaActivation: () => dispatch(cgnEycaActivation.request()),
  getEycaActivationStatus: () => dispatch(cgnEycaActivationStatusRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EycaDetailComponent);
