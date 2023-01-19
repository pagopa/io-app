const DESIGN_SYSTEM_ROUTES = {
  MAIN: "DESIGN_SYSTEM_MAIN",
  FOUNDATION: {
    COLOR: { route: "DESIGN_SYSTEM_COLOR", title: "Colors" },
    TYPOGRAPHY: { route: "DESIGN_SYSTEM_TYPOGRAPHY", title: "Typography" },
    SPACING: { route: "DESIGN_SYSTEM_SPACING", title: "Spacing" },
    ICONS: { route: "DESIGN_SYSTEM_ICONS", title: "Icons" },
    PICTOGRAMS: { route: "DESIGN_SYSTEM_PICTOGRAMS", title: "Pictograms" },
    LOGOS: { route: "DESIGN_SYSTEM_LOGOS", title: "Logos" }
  },
  COMPONENTS: {
    BUTTONS: { route: "DESIGN_SYSTEM_BUTTONS", title: "Buttons" },
    TEXT_FIELDS: { route: "DESIGN_SYSTEM_TEXT_FIELDS", title: "Text Fields" },
    LIST_ITEMS: { route: "DESIGN_SYSTEM_LIST_ITEMS", title: "List Items" },
    TOASTS: { route: "DESIGN_SYSTEM_TOASTS", title: "Toasts" },
    SELECTION: { route: "DESIGN_SYSTEM_SELECTION", title: "Selection" },
    ACCORDION: { route: "DESIGN_SYSTEM_ACCORDION", title: "Accordion" },
    ADVICE: { route: "DESIGN_SYSTEM_ADVICE", title: "Advice" }
  },
  LEGACY: {
    PICTOGRAMS: {
      route: "DESIGN_SYSTEM_LEGACY_PICTOGRAMS",
      title: "Legacy Pictograms"
    },
    ILLUSTRATIONS: {
      route: "DESIGN_SYSTEM_LEGACY_ILLUSTRATIONS",
      title: "Legacy Illustrations"
    }
  } as const
} as const;

export default DESIGN_SYSTEM_ROUTES;
