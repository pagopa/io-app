import { useSecuritySuggestionsBottomSheet } from "../../../../hooks/useSecuritySuggestionBottomSheet";

export const SecuritySuggestions = () => {
  const { securitySuggestionBottomSheet } =
    useSecuritySuggestionsBottomSheet(false);
  return securitySuggestionBottomSheet;
};
