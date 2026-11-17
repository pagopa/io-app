import type { IconSvgObject } from "@hugeicons/core-free-icons/types";

import { createElement } from "react";

type Props = {
  icon: IconSvgObject;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  title?: string;
};

export const IconButton = ({
  icon,
  label,
  title = label,
  pressed,
  onClick
}: Props) => (
  <button
    aria-label={label}
    aria-pressed={pressed}
    className="icon-button"
    onClick={onClick}
    title={title}
    type="button"
  >
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {icon.map(
        ([tag, { key, strokeWidth: _strokeWidth, ...attributes }], index) =>
          createElement(tag, { ...attributes, key: key ?? index })
      )}
    </svg>
  </button>
);
