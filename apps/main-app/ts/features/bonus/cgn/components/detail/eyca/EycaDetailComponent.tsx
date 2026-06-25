import {
  Alert,
  ListItemHeader,
  LoadingSpinner
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { JSX, useCallback, useEffect } from "react";
import { View } from "react-native";

import { CardPending } from "../../../../../../../definitions/cgn/CardPending";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import { isLoading } from "../../../../../../common/model/RemoteValue";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
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

const EycaDetailComponent = () => {
  const dispatch = useIODispatch();
  const eyca = useIOSelector(eycaCardSelector);
  const eycaActivationStatus = useIOSelector(cgnEycaActivationStatus);
  const eycaDetails = useIOSelector(eycaDetailSelector);
  const isActivationLoading = useIOSelector(cgnEycaActivationLoading);
  const isLoadingState = isLoading(eycaDetails) || isActivationLoading;

  const { present, bottomSheet } = useEycaInformationBottomSheet();

  const getEycaActivationStatus = useCallback(() => {
    dispatch(cgnEycaActivationStatusRequest());
  }, [dispatch]);

  const requestEycaActivation = useCallback(() => {
    dispatch(cgnEycaActivation.request());
  }, [dispatch]);

  useEffect(() => {
    if (CardPending.is(eyca)) {
      getEycaActivationStatus();
    }
  }, [eyca, getEycaActivationStatus]);

  const errorComponent = (
    <Alert
      action={I18n.t("global.buttons.retry")}
      content={I18n.t("bonus.cgn.detail.status.eycaError")}
      onPress={requestEycaActivation}
      testID="eyca-error-component"
      variant="error"
    />
  );

  const renderComponentEycaStatus = (
    eycaCard: EycaCard
  ): JSX.Element | null => {
    switch (eycaCard.status) {
      case "ACTIVATED":
      case "EXPIRED":
      case "REVOKED":
        return <EycaStatusDetailsComponent eycaCard={eycaCard} />;
      case "PENDING":
        return pipe(
          eycaActivationStatus,
          O.fromNullable,
          O.fold(
            () => errorComponent,
            as =>
              as === "ERROR" || as === "NOT_FOUND" ? (
                errorComponent
              ) : (
                <Alert
                  content={I18n.t("bonus.cgn.detail.status.eycaPending")}
                  testID="eyca-pending-component"
                  variant="info"
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
      {isLoadingState ? (
        <LoadingSpinner size={48} />
      ) : (
        <>
          <ListItemHeader
            endElement={{
              type: "iconButton",
              componentProps: {
                icon: "info",
                onPress: present,
                accessibilityLabel: "Apri bottom sheet"
              }
            }}
            label={I18n.t("bonus.cgn.detail.status.eyca")}
          />
          {pipe(
            eyca,
            O.fromNullable,
            O.fold(() => errorComponent, renderComponentEycaStatus)
          )}
        </>
      )}
      {bottomSheet}
    </View>
  );
};

export default EycaDetailComponent;
