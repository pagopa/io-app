const DESIGN_SYSTEM_ROUTES = {
  MAIN: { route: "DESIGN_SYSTEM_MAIN", title: "Design System" },
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
    MODULES: { route: "DESIGN_SYSTEM_MODULES", title: "Modules" },
    BADGE: { route: "DESIGN_SYSTEM_BADGE", title: "Badges & Tags" },
    TOASTS: { route: "DESIGN_SYSTEM_TOASTS", title: "Toasts" },
    SELECTION: { route: "DESIGN_SYSTEM_SELECTION", title: "Selection" },
    ACCORDION: { route: "DESIGN_SYSTEM_ACCORDION", title: "Accordion" },
    ALERT: { route: "DESIGN_SYSTEM_ALERT", title: "Alert" },
    ADVICE: { route: "DESIGN_SYSTEM_ADVICE", title: "Advice & Banners" },
    CARDS: { route: "DESIGN_SYSTEM_CARDS", title: "Cards" },
    BOTTOM_SHEET: {
      route: "DESIGN_SYSTEM_BOTTOM_SHEET",
      title: "Bottom Sheet"
    },
    TAB_NAVIGATION: {
      route: "DESIGN_SYSTEM_TAB_NAVIGATION",
      title: "Tab Navigation"
    },
    WALLET: {
      route: "DESIGN_SYSTEM_WALLET",
      title: "Wallet"
    }
  },
  HEADERS: {
    FIRST_LEVEL: { route: "DS_HEADER_1LEVEL", title: "First Level" },
    SECOND_LEVEL: { route: "DS_HEADER_2LEVEL", title: "Second Level" },
    SECOND_LEVEL_SECTION_TITLE: {
      route: "DS_HEADER_2LEVEL_SECTITLE",
      title: "Second Level (w/ section title)"
    }
  },
  SCREENS: {
    GRADIENT_SCROLL: {
      route: "GRADIENT_SCROLL",
      title: "Gradient scroll + Actions"
    },
    OPERATION_RESULT: {
      route: "DS_SCREEN_OPERATION_RESULT",
      title: "Operation result"
    },
    WIZARD_SCREEN: {
      route: "WIZARD_SCREEN",
      title: "Wizard Screen"
    },
    BONUS_CARD_SCREEN: {
      route: "BONUS_CARD_SCREEN",
      title: "Bonus Card Screen"
    },
    NUMBERPAD: {
      route: "DS_NUMBERPAD",
      title: "NumberPad"
    }
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
    },
    FULL_SCREEN_MODAL: {
      route: "DS_FULLSCR_MODAL",
      title: "Full screen modal"
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
    }
  } as const
} as const;

export default DESIGN_SYSTEM_ROUTES;
