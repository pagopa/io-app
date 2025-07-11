import { IOButtonProps } from "@pagopa/io-app-design-system";
import { Platform } from "react-native";
import I18n from "../../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ItwCieMachineContext } from "../machine/provider";
import { selectReadProgress } from "../machine/selectors";
import { trackItWalletCardReadingClose } from "../../../analytics";
import {
  CieCardReadContentProps,
  ItwCieCardReadContent
} from "./ItwCieCardReadContent";

type ReadState = "idle" | "reading" | "completed";

export const ItwCieCardReadProgressContent = () => {
  const props = useProgressContentProps();
  return <ItwCieCardReadContent {...props} />;
};

const useProgressContentProps = (): CieCardReadContentProps => {
  const issuanceActor = ItwEidIssuanceMachineContext.useActorRef();
  const progress = ItwCieMachineContext.useSelector(selectReadProgress);

  const platform = Platform.select({
    ios: "ios" as const,
    default: "android" as const
  });

  const state: ReadState =
    progress <= 0 ? "idle" : progress < 1 ? "reading" : "completed";

  const cancelAction: IOButtonProps = {
    variant: "link",
    label: I18n.t("global.buttons.cancel"),
    onPress: () => {
      // On Android, we need to track the manual close when the user taps on the close button
      // On iOS this event is tracked by the machine, which receives the CANCELLED_BY_USER event from the SDK
      Platform.select({ android: trackItWalletCardReadingClose })?.();
      issuanceActor.send({ type: "close" });
    }
  };

  switch (state) {
    case "idle": {
      return {
        progress,
        title: I18n.t(
          `features.itWallet.identification.cie.readingCard.${platform}.idle.title`
        ),
        pictogram: "nfcScaniOS",
        secondaryAction: cancelAction
      };
    }
    case "reading": {
      return {
        progress,
        title: I18n.t(
          `features.itWallet.identification.cie.readingCard.${platform}.reading.title`
        ),
        subtitle: I18n.t(
          `features.itWallet.identification.cie.readingCard.${platform}.reading.subtitle`
        ),
        pictogram: "nfcScaniOS",
        secondaryAction: cancelAction
      };
    }
    case "completed":
      return {
        progress,
        title: I18n.t(
          `features.itWallet.identification.cie.readingCard.${platform}.completed.title`
        ),
        pictogram: "success"
      };
  }
};
