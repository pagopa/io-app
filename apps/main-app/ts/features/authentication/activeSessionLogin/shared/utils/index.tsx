import I18n from "i18next";
import { Platform } from "react-native";

import { ReadingState } from "../../../login/cie/components/CieCardReadingAnimation";

export type TextForState = {
  content: string;
  subtitle?: string;
  title: string;
};

// some texts changes depending on current running Platform
export const getTextForState = (
  state: ReadingState.error | ReadingState.waiting_card,
  errorMessage = ""
): TextForState => {
  const texts: Record<
    ReadingState.error | ReadingState.waiting_card,
    TextForState
  > = Platform.select({
    ios: {
      [ReadingState.waiting_card]: {
        title: I18n.t("authentication.cie.card.titleiOS"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeaderiOS"),
        // the native alert hides the screen content and shows a message it self
        content: ""
      },
      [ReadingState.error]: {
        title: I18n.t("authentication.cie.card.error.readerCardLostTitle"),
        subtitle: "",
        // the native alert hides the screen content and shows a message it self
        content: ""
      },
      [ReadingState.reading]: {
        title: I18n.t("authentication.cie.card.titleiOS"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeaderiOS"),
        // the native alert hides the screen content and shows a message it self
        content: ""
      }
    },
    default: {
      [ReadingState.waiting_card]: {
        title: I18n.t("authentication.cie.card.title"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeader"),
        content: I18n.t("authentication.cie.card.layCardMessageFooter")
      },
      [ReadingState.error]: {
        title: I18n.t("authentication.cie.card.error.readerCardLostTitle"),
        subtitle: I18n.t("authentication.cie.card.error.onTagLost"),
        content: errorMessage
      }
    }
  });
  return texts[state];
};

export const ACS_PATH = "/assertionConsumerService";
