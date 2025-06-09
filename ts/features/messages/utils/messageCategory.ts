import { MessageCategory } from "../../../../definitions/communications/MessageCategory";
import { TagEnum } from "../../../../definitions/communications/MessageCategoryBase";
import { MessageCategoryPN } from "../../../../definitions/communications/MessageCategoryPN";
import { MessageCategoryPayment } from "../../../../definitions/communications/MessageCategoryPayment";

export const foldMessageCategoryK =
  <A>(
    onGeneral: (baseCategoryEnum: TagEnum) => A,
    onPayment: (category: MessageCategoryPayment) => A,
    onSend: (category: MessageCategoryPN) => A
  ) =>
  (category: MessageCategory) => {
    switch (category.tag) {
      case "PAYMENT":
        return onPayment(category);
      case "PN":
        return onSend(category);
      case "LEGAL_MESSAGE":
        return onGeneral(TagEnum.LEGAL_MESSAGE);
      case "EU_COVID_CERT":
        return onGeneral(TagEnum.EU_COVID_CERT);
    }
    return onGeneral(TagEnum.GENERIC);
  };
