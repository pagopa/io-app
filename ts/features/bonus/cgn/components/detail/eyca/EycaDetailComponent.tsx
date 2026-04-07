import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { JSX, useEffect } from "react";
import { connect } from "react-redux";
import {
  Alert,
  ListItemHeader,
  LoadingSpinner
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { CardPending } from "../../../../../../../definitions/cgn/CardPending";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import { Dispatch } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { isLoading } from "../../../../../../common/model/RemoteValue";
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
import { useEycaInformationBottomSheet } from "./EycaInformationComponent";
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
    <Alert
      content={I18n.t("bonus.cgn.detail.status.eycaError")}
      testID="eyca-error-component"
      variant="error"
      onPress={props.requestEycaActivation}
      action={I18n.t("global.buttons.retry")}
    />
  );

  const renderComponentEycaStatus = (eyca: EycaCard): JSX.Element | null => {
    switch (eyca.status) {
      case "ACTIVATED":
      case "REVOKED":
      case "EXPIRED":
        return <EycaStatusDetailsComponent eycaCard={eyca} />;
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
                <Alert
                  testID="eyca-pending-component"
                  variant="info"
                  content={I18n.t("bonus.cgn.detail.status.eycaPending")}
                />
              )
          )
        );
      default:
        return null;
    }
  };
  return (
    <View>
      {props.isLoading ? (
        <LoadingSpinner size={48} />
      ) : (
        <>
          <ListItemHeader
            label={I18n.t("bonus.cgn.detail.status.eyca")}
            endElement={{
              type: "iconButton",
              componentProps: {
                icon: "info",
                onPress: present,
                accessibilityLabel: "Apri bottom sheet"
              }
            }}
          />
          {pipe(
            props.eyca,
            O.fromNullable,
            O.fold(() => errorComponent, renderComponentEycaStatus)
          )}
        </>
      )}
      {bottomSheet}
    </View>
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
