import { IOButtonProps } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect } from "react";
import { Platform } from "react-native";
import {
  trackItWalletCardReadingClose,
  trackItWalletCieCardReadingSuccess
} from "../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectIdentification
} from "../../../machine/eid/selectors";
import { CieManagerState } from "../hooks/useCieManager";
import { CieCardReadContent } from "../../../../common/components/cie/CieCardReadContent";

type ItwCieCardReadProgressContentProps = Exclude<
  CieManagerState,
  { state: "failure" }
>;

/**
 * Renders the CIE read progress content based on the current progress and platform
 */
export const ItwCieCardReadProgressContent = (
  props: ItwCieCardReadProgressContentProps
) => {
  const issuanceActor = ItwEidIssuanceMachineContext.useActorRef();
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  const itw_flow = isL3 ? "L3" : "L2";

  // Track success
  useEffect(() => {
    if (props.state === "success") {
      trackItWalletCieCardReadingSuccess({
        itw_flow,
        ITW_ID_method: identification?.mode
      });
    }
  }, [props.state, itw_flow, identification?.mode]);

  const platform = Platform.select({
    ios: "ios" as const,
    default: "android" as const
  });

  const cancelAction: IOButtonProps = {
    variant: "link",
    label: I18n.t("global.buttons.cancel"),
    onPress: () => {
      // On Android, we need to track the manual close when the user taps on the close button
      // On iOS this event is tracked by the machine, which receives the CANCELLED_BY_USER event from the SDK
      Platform.select({
        android: () => {
          const progress = props.state === "reading" ? props.progress : 0;
          // progress is a number between 0 and 1, mixpanel needs a number between 0 and 100
          const percentage = Number((progress * 100).toFixed(0));
          return trackItWalletCardReadingClose({
            cie_reading_progress: percentage,
            itw_flow,
            ITW_ID_method: identification?.mode
          });
        }
      })?.();
      issuanceActor.send({ type: "close" });
    }
  };

  switch (props.state) {
    case "idle": {
      return (
        <CieCardReadContent
          progress={0}
          title={I18n.t(
            `features.itWallet.identification.cie.readingCard.${platform}.idle.title`
          )}
          pictogram="nfcScaniOS"
          secondaryAction={cancelAction}
        />
      );
    }
    case "reading": {
      return (
        <CieCardReadContent
          progress={props.progress}
          title={I18n.t(
            `features.itWallet.identification.cie.readingCard.${platform}.reading.title`
          )}
          subtitle={I18n.t(
            `features.itWallet.identification.cie.readingCard.${platform}.reading.subtitle`
          )}
          pictogram="nfcScaniOS"
          secondaryAction={cancelAction}
        />
      );
    }
    case "success":
      return (
        <CieCardReadContent
          progress={1}
          title={I18n.t(
            `features.itWallet.identification.cie.readingCard.${platform}.completed.title`
          )}
          pictogram="success"
        />
      );
  }
};
