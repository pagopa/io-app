import type { IOColorProducts } from "../../core/tokens/colors/product";
import type {
  IOColorSemantics,
  IOComponentColors
} from "../../core/tokens/colors/semantic";
import type { Badge } from "./Badge";

export const badgeColors = (s: IOColorSemantics, product: IOColorProducts) =>
  ({
    default: {
      background: { default: s.surface.accent },
      foreground: { default: s.text.label.onTint.accent }
    },
    warning: {
      background: { default: s.surface.warning },
      foreground: { default: s.text.label.onTint.warning }
    },
    success: {
      background: { default: s.surface.success },
      foreground: { default: s.text.label.onTint.success }
    },
    error: {
      background: { default: s.surface.error },
      foreground: { default: s.text.label.onTint.error }
    },
    cgn: {
      background: { default: product.cgn.surface },
      foreground: { default: product.cgn.content }
    },
    highlight: {
      background: { default: s.surface.highlight },
      foreground: { default: s.text.label.onTint.highlight }
    }
  }) satisfies Record<Badge["variant"], IOComponentColors>;
