const SHOWROOM_ROUTES = {
  MAIN: "SHOWROOM_MAIN",
  FOUNDATION: {
    COLOR: { id: "SHOWROOM_COLOR", title: "Colors" },
    TYPOGRAPHY: { id: "SHOWROOM_TYPOGRAPHY", title: "Typography" },
    ICONS: { id: "SHOWROOM_ICONS", title: "Icons" },
    PICTOGRAMS: { id: "SHOWROOM_PICTOGRAMS", title: "Pictograms" },
    LOGOS: { id: "SHOWROOM_LOGOS", title: "Logos" }
  },
  COMPONENTS: {
    BUTTONS: { id: "SHOWROOM_BUTTONS", title: "Buttons" },
    TEXT_FIELDS: { id: "SHOWROOM_TEXT_FIELDS", title: "Text Fields" },
    TOASTS: { id: "SHOWROOM_TOASTS", title: "Toasts" },
    SELECTION: { id: "SHOWROOM_SELECTION", title: "Selection" },
    ACCORDION: { id: "SHOWROOM_ACCORDION", title: "Accordion" },
    ADVICE: { id: "SHOWROOM_ADVICE", title: "Advice" }
  },
  LEGACY: {
    PICTOGRAMS: {
      id: "SHOWROOM_LEGACY_PICTOGRAMS",
      title: "Legacy Pictograms"
    },
    ILLUSTRATIONS: {
      id: "SHOWROOM_LEGACY_ILLUSTRATIONS",
      title: "Legacy Illustrations"
    }
  } as const
} as const;

export default SHOWROOM_ROUTES;
