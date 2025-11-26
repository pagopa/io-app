import { IOButtonProps } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect } from "react";
import { Platform } from "react-native";
import {
  trackItWalletCardReadingClose,
  trackItWalletCieCardReadingSuccess
} from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { CieManagerState } from "../hooks/useCieManager";
import { ItwCieCardReadContent } from "./ItwCieCardReadContent";

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

  // Track success
  useEffect(() => {
    if (props.state === "success") {
      trackItWalletCieCardReadingSuccess(isL3 ? "L3" : "L2");
    }
  }, [props.state, isL3]);

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
          return trackItWalletCardReadingClose(percentage);
        }
      })?.();
      issuanceActor.send({ type: "close" });
    }
  };

  switch (props.state) {
    case "idle": {
      return (
        <ItwCieCardReadContent
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
        <ItwCieCardReadContent
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
        <ItwCieCardReadContent
          progress={1}
          title={I18n.t(
            `features.itWallet.identification.cie.readingCard.${platform}.completed.title`
          )}
          pictogram="success"
        />
      );
  }
};
