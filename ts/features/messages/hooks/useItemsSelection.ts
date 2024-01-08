import { useState } from "react";
import * as O from "fp-ts/lib/Option";

/**
 * Hook to persist a set representing selected strings.
 * The initial and reset status is `none` implying that there is no selection active.
 * An empty set represents and active selection with zero items.
 */
export const useItemsSelection = () => {
  const [selections, setSelections] = useState<null | ReadonlySet<string>>(
    null
  );
  const selectedItems: O.Option<ReadonlySet<string>> =
    O.fromNullable(selections);

  return {
    selectedItems,

    toggleItem: (id: string): void => {
      if (selections) {
        const newSelections = new Set(selections);
        if (selections.has(id)) {
          newSelections.delete(id);
        } else {
          newSelections.add(id);
        }
        setSelections(newSelections);
      } else {
        setSelections(new Set([id]));
      }
    },

    setAllItems: (ids: Array<string>) => {
      setSelections(new Set(ids));
    },

    resetSelection: (): void => {
      setSelections(null);
    }
  };
};
