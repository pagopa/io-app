import { useIOSelector } from "../../../../store/hooks";
import { shouldShowFooterListComponentSelector } from "../../store/reducers/allPaginated";
import { MessageListCategory } from "../../types/messageListCategory";
import I18n from "../../../../i18n";
import { MessageListItemSkeleton } from "./DS/MessageListItemSkeleton";

type FooterProps = {
  category: MessageListCategory;
};

export const Footer = ({ category }: FooterProps) => {
  const shouldShowFooter = useIOSelector(state =>
    shouldShowFooterListComponentSelector(state, category)
  );
  if (!shouldShowFooter) {
    return null;
  }
  return (
    <MessageListItemSkeleton accessibilityLabel={I18n.t("messages.loading")} />
  );
};
