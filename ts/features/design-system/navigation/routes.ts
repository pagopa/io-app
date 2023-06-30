const DESIGN_SYSTEM_ROUTES = {
  MAIN: "DESIGN_SYSTEM_MAIN",
  FOUNDATION: {
    COLOR: { route: "DESIGN_SYSTEM_COLOR", title: "Colors" },
    TYPOGRAPHY: { route: "DESIGN_SYSTEM_TYPOGRAPHY", title: "Typography" },
    LAYOUT: { route: "DESIGN_SYSTEM_LAYOUT", title: "Layout" },
    ICONS: { route: "DESIGN_SYSTEM_ICONS", title: "Icons" },
    PICTOGRAMS: { route: "DESIGN_SYSTEM_PICTOGRAMS", title: "Pictograms" },
    LOGOS: { route: "DESIGN_SYSTEM_LOGOS", title: "Logos" },
    LOADERS: { route: "DESIGN_SYSTEM_LOADERS", title: "Loaders" },
    HAPTIC_FEEDBACK: { route: "DESIGN_SYSTEM_HAPTIC", title: "Haptic Feedback" }
  },
  COMPONENTS: {
    BUTTONS: { route: "DESIGN_SYSTEM_BUTTONS", title: "Buttons" },
    TEXT_FIELDS: { route: "DESIGN_SYSTEM_TEXT_FIELDS", title: "Text Fields" },
    LIST_ITEMS: { route: "DESIGN_SYSTEM_LIST_ITEMS", title: "List Items" },
    BADGE: { route: "DESIGN_SYSTEM_BADGE", title: "Badge" },
    TOASTS: { route: "DESIGN_SYSTEM_TOASTS", title: "Toasts" },
    SELECTION: { route: "DESIGN_SYSTEM_SELECTION", title: "Selection" },
    ACCORDION: { route: "DESIGN_SYSTEM_ACCORDION", title: "Accordion" },
    ALERT: { route: "DESIGN_SYSTEM_ALERT", title: "Alert" },
    ADVICE: { route: "DESIGN_SYSTEM_ADVICE", title: "Advice & Banners" },
    BOTTOM_SHEET: {
      route: "DESIGN_SYSTEM_BOTTOM_SHEET",
      title: "Bottom Sheet"
    }
  },
  HEADERS: {
    FIRST_LEVEL: { route: "DS_HEADER_1LEVEL", title: "First Level" }
  },
  DEBUG: {
    SAFE_AREA: { route: "DS_SAFE_AREA", title: "Native safe area" },
    SAFE_AREA_CENTERED: {
      route: "DS_SAFE_AREA_CENTERED",
      title: "Native safe area (centered)"
    },
    EDGE_TO_EDGE_AREA: {
      route: "DS_EDGE_TO_EDGE_AREA",
      title: "Edge to edge area"
    }
  },
  LEGACY: {
    PICTOGRAMS: {
      route: "DESIGN_SYSTEM_LEGACY_PICTOGRAMS",
      title: "Pictograms"
    },
    ILLUSTRATIONS: {
      route: "DESIGN_SYSTEM_LEGACY_ILLUSTRATIONS",
      title: "Illustrations"
    },
    BUTTONS: {
      route: "DESIGN_SYSTEM_LEGACY_BUTTONS",
      title: "Buttons"
    }
  } as const
} as const;

export default DESIGN_SYSTEM_ROUTES;
