import { Theme } from "../../types";

export default (): Theme => {
  return {
    "NativeBase.ViewNB": {
      "UIComponent.MarkdownParagraph": {
        "NativeBase.ViewNB": {
          "UIComponent.MarkdownText": {
            lineHeight: 21
          },

          "NativeBase.Text": {
            lineHeight: 21,

            "UIComponent.MarkdownText": {
              lineHeight: 21
            }
          }
        },

        padding: 0
      },

      backgroundColor: "#c1f4f2",
      borderRadius: 8,
      marginBottom: 50,
      padding: 10
    }
  };
};
