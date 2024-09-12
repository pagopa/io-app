import { GlobalState } from "../../../store/reducers/types";
import { trackMessageSearchResult } from "../analytics";
import { searchMessagesUncachedSelector } from "../store/reducers/allPaginated";

export const getMessageSearchResult = (
  searchQuery: string,
  minQueryLength: number,
  state: GlobalState
) => {
  const searchResult = searchMessagesUncachedSelector(
    state,
    searchQuery,
    minQueryLength
  );
  const searchResultCount = searchResult.length;
  if (searchResultCount > 0) {
    trackMessageSearchResult(searchResultCount);
  }
  return searchResult;
};
