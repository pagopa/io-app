/** Tracks the machine shown in the page. */
export const createSelectionStore = () => {
  const selection = { sessionId: undefined, pinned: false };
  return {
    current: () => selection.sessionId,
    // Follows the newest machine until the user picks one.
    follows: () => !selection.pinned,
    select: (sessionId, { pin }) => {
      selection.sessionId = sessionId;
      selection.pinned ||= pin;
    }
  };
};
