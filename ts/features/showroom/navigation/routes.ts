const SHOWROOM_ROUTES = {
  MAIN: "SHOWROOM_MAIN",
  FOUNDATION: {
    COLOR: { route: "SHOWROOM_COLOR", title: "Colors" },
    TYPOGRAPHY: { route: "SHOWROOM_TYPOGRAPHY", title: "Typography" },
    ICONS: { route: "SHOWROOM_ICONS", title: "Icons" },
    PICTOGRAMS: { route: "SHOWROOM_PICTOGRAMS", title: "Pictograms" },
    LOGOS: { route: "SHOWROOM_LOGOS", title: "Logos" }
  },
  COMPONENTS: {
    BUTTONS: { route: "SHOWROOM_BUTTONS", title: "Buttons" },
    TEXT_FIELDS: { route: "SHOWROOM_TEXT_FIELDS", title: "Text Fields" },
    LIST_ITEMS: { route: "SHOWROOM_LIST_ITEMS", title: "List Items" },
    TOASTS: { route: "SHOWROOM_TOASTS", title: "Toasts" },
    SELECTION: { route: "SHOWROOM_SELECTION", title: "Selection" },
    ACCORDION: { route: "SHOWROOM_ACCORDION", title: "Accordion" },
    ADVICE: { route: "SHOWROOM_ADVICE", title: "Advice" }
  },
  LEGACY: {
    PICTOGRAMS: {
      route: "SHOWROOM_LEGACY_PICTOGRAMS",
      title: "Legacy Pictograms"
    },
    ILLUSTRATIONS: {
      route: "SHOWROOM_LEGACY_ILLUSTRATIONS",
      title: "Legacy Illustrations"
    }
  } as const
} as const;

export default SHOWROOM_ROUTES;
