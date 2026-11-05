/** The smallest client rect containing all `elements`, if any. */
export const unionRect = elements =>
  [...elements]
    .map(element => element.getBoundingClientRect())
    .reduce(
      (union, rect) =>
        union === undefined
          ? rect
          : DOMRect.fromRect({
              x: Math.min(union.left, rect.left),
              y: Math.min(union.top, rect.top),
              width:
                Math.max(union.right, rect.right) -
                Math.min(union.left, rect.left),
              height:
                Math.max(union.bottom, rect.bottom) -
                Math.min(union.top, rect.top)
            }),
      undefined
    );
