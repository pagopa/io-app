export type SelectionStore = ReturnType<typeof createSelectionStore>;

/** Tracks the machine shown in the page. */
export const createSelectionStore = () => {
  const selection: { pinned: boolean; sessionId: string | undefined } = {
    sessionId: undefined,
    pinned: false
  };
  return {
    current: () => selection.sessionId,
    // Follows the newest machine until the user picks one.
    follows: () => !selection.pinned,
    select: (sessionId: string, { pin }: { pin: boolean }) => {
      selection.sessionId = sessionId;
      selection.pinned ||= pin;
    }
  };
};
