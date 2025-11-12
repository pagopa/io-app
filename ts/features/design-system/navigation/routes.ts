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
    COLLAPSIBLE: { route: "DESIGN_SYSTEM_COLLAPSIBLE", title: "Collapsible" },
    ALERT: { route: "DESIGN_SYSTEM_ALERT", title: "Alert" },
    STEPPER: { route: "DESIGN_SYSTEM_STEPPER", title: "Stepper" },
    OTP_INPUT: { route: "DESIGN_SYSTEM_OTP_INPUT", title: "OTP Input" },
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
    },
    IO_MARKDOWN: {
      route: "IO_MARKDOWN",
      title: "IOMarkdown"
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
    OPERATION_RESULT: {
      route: "DS_SCREEN_OPERATION_RESULT",
      title: "Operation result"
    },
    OPERATION_RESULT_ANIMATED: {
      route: "DS_SCREEN_OPERATION_RESULT_ANIMATED",
      title: "Operation result (animated)"
    },
    IOSCROLLVIEW: {
      route: "IOSCROLLVIEW",
      title: "IOScrollView"
    },
    IOSCROLLVIEW_WO_ACTIONS: {
      route: "IOSCROLLVIEW_WO_ACTIONS",
      title: "IOScrollView w/o Actions"
    },
    IOSCROLLVIEW_LARGEHEADER: {
      route: "IOSCROLLVIEW_LARGEHEADER",
      title: "IOScrollView w/ Large header"
    },
    IOSCROLLVIEW_CENTRED_CONTENT: {
      route: "IOSCROLLVIEW_CENTRED_CONTENT",
      title: "IOScrollView w/ Centred content"
    },
    IOSCROLLVIEW_WITH_LIST_ITEMS: {
      route: "IOSCROLLVIEW_WITH_LIST_ITEMS",
      title: "IOScrollView w/ List items"
    },
    IOLISTVIEW_LARGE_HEADER: {
      route: "IOLISTVIEW_LARGE_HEADER",
      title: "IOListView w/ Large header"
    },
    FORSCESCROLLDOWNVIEW_ACTIONS: {
      route: "FORSCESCROLLDOWNVIEW_ACTIONS",
      title: "ForceScrollDownView w/ Actions"
    },
    FORSCESCROLLDOWNVIEW_CUSTOM_SLOT: {
      route: "FORSCESCROLLDOWNVIEW_CUSTOM_SLOT",
      title: "ForceScrollDownView w/ Custom slot"
    },
    BONUS_CARD_SCREEN: {
      route: "BONUS_CARD_SCREEN",
      title: "Bonus Card Screen"
    },
    NUMBERPAD: {
      route: "DS_NUMBERPAD",
      title: "NumberPad"
    },
    LOADING_SCREEN: {
      route: "DS_LOADING_SCREEN",
      title: "Loading Screen"
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
      title: "Full screen modal (native)"
    },
    SCREEN_END_MARGIN: {
      route: "DS_SCREEN_END_MARGIN",
      title: "Screen End margin"
    },
    FOOTER_ACTIONS: {
      route: "DESIGN_SYSTEM_FOOTER_ACTIONS",
      title: "Footer Actions"
    },
    FOOTER_ACTIONS_STICKY: {
      route: "DS_FOOTER_ACTIONS_STICKY",
      title: "Footer Actions (sticky)"
    },
    FOOTER_ACTIONS_NOT_FIXED: {
      route: "DS_FOOTER_ACTIONS_NOT_FIXED",
      title: "Footer Actions (not fixed)"
    },
    FOOTER_ACTIONS_INLINE: {
      route: "DS_FOOTER_ACTIONS_INLINE",
      title: "Footer Actions Inline"
    },
    FOOTER_ACTIONS_INLINE_NOT_FIXED: {
      route: "DS_FOOTER_ACTIONS_INLINE_NOT_FIXED",
      title: "Footer Actions Inline (not fixed)"
    }
  },
  EXPERIMENTAL_LAB: {
    DYNAMIC_BACKGROUND: {
      route: "DS_DYNAMIC_BACKGROUND",
      title: "Dynamic header background"
    },
    DYNAMIC_CARD_ROTATION: {
      route: "DYNAMIC_CARD_ROTATION",
      title: "Dynamic card based on device rotation"
    },
    IRIDESCENT_TRUSTMARK: {
      route: "DS_IRIDESCENT_TRUSTMARK",
      title: "Iridescent trustmark"
    },
    ANIMATED_PICTOGRAMS: {
      route: "DS_ANIMATED_PICTOGRAMS",
      title: "Animated pictograms"
    },
    ITWALLET_BRAND_1: {
      route: "DS_ITWALLET_BRAND_1",
      title: "ITWallet brand exploration (#1)"
    }
  },
  LEGACY: {
    BUTTONS: {
      route: "DESIGN_SYSTEM_LEGACY_BUTTONS",
      title: "Buttons"
    },
    ADVICE: {
      route: "DESIGN_SYSTEM_LEGACY_ADVICE",
      title: "Advice & Banners"
    }
  } as const
} as const;

export default DESIGN_SYSTEM_ROUTES;
