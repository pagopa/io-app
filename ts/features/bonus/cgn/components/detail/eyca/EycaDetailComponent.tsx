import * as React from "react";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { GlobalState } from "../../../../../../store/reducers/types";
import { Dispatch } from "../../../../../../store/actions/types";
import {
  eycaCardSelector,
  eycaDetailSelector
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
import { isLoading } from "../../../../bpd/model/RemoteValue";
import EycaStatusDetailsComponent from "./EycaStatusDetailsComponent";
import EycaPendingComponent from "./EycaPendingComponent";
import EycaErrorComponent from "./EycaErrorComponent";
import { useEycaInformationBottomSheet } from "./EycaInformationComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const EycaDetailComponent = (props: Props) => {
  const { present } = useEycaInformationBottomSheet();

  const openEycaBottomSheet = async () => {
    await present();
  };

  const { eyca, getEycaActivationStatus } = props;

  useEffect(() => {
    if (CardPending.is(eyca)) {
      getEycaActivationStatus();
    }
  }, [eyca, getEycaActivationStatus]);

  const errorComponent = (
    <EycaErrorComponent
      onRetry={props.requestEycaActivation}
      openBottomSheet={openEycaBottomSheet}
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
            openBottomSheet={openEycaBottomSheet}
          />
        );
      case "PENDING":
        return fromNullable(props.eycaActivationStatus).fold(
          errorComponent,
          as =>
            as === "ERROR" || as === "NOT_FOUND" ? (
              errorComponent
            ) : (
              <EycaPendingComponent openBottomSheet={openEycaBottomSheet} />
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
        fromNullable(props.eyca).fold(errorComponent, renderComponentEycaStatus)
      )}
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
