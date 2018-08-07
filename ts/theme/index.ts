/**
 * This file exports a function to create the whole theme of the application.
 * It takes our custom variables and mixes them with each defined component theme.
 */

import merge from "lodash/merge";
import getTheme from "native-base/src/theme/components";
import buttonTheme from "./components/Button";
import contentTheme from "./components/Content";
import footerWithButtonsTheme from "./components/FooterWithButtons";
import h1Theme from "./components/H1";
import h2Theme from "./components/H2";
import h3Theme from "./components/H3";
import h4Theme from "./components/H4";
import h5Theme from "./components/H5";
import h6Theme from "./components/H6";
import headerTheme from "./components/Header";
import iconFontTheme from "./components/IconFont";
import itemTheme from "./components/Item";
import listItemTheme from "./components/ListItem";
import messageComponent from "./components/MessageComponent";
import messageDetailsInfoComponentTheme from "./components/MessageDetailsInfoComponent";
import modalTheme from "./components/Modal";
import preferenceItemTheme from "./components/PreferenceItem";
import screenHeaderTheme from "./components/ScreenHeader";
import tabContainerTheme from "./components/TabContainer";
import tabHeadingTheme from "./components/TabHeading";
import textTheme from "./components/Text";
import textWithIconTheme from "./components/TextWithIcon";
import topScreenComponentTheme from "./components/TopScreenComponent";
import viewTheme from "./components/View";
import { Theme } from "./types";
import variables from "./variables";

const theme = (): Theme => {
  const nbTheme = getTheme(variables);
  const overrides = {
    "NativeBase.Button": {
      ...buttonTheme()
    },
    "NativeBase.Content": {
      ...contentTheme()
    },
    "NativeBase.H1": {
      ...h1Theme()
    },
    "NativeBase.H2": {
      ...h2Theme()
    },
    "NativeBase.H3": {
      ...h3Theme()
    },
    "UIComponent.H4": {
      ...h4Theme()
    },
    "UIComponent.H5": {
      ...h5Theme()
    },
    "UIComponent.H6": {
      ...h6Theme()
    },
    "NativeBase.Header": {
      ...headerTheme()
    },
    "NativeBase.Item": {
      ...itemTheme()
    },
    "UIComponents.Modal": {
      ...modalTheme()
    },
    "NativeBase.Text": {
      ...textTheme()
    },
    "UIComponents.TextWithIcon": {
      ...textWithIconTheme()
    },
    "UIComponents.IconFont": {
      ...iconFontTheme()
    },
    "NativeBase.ViewNB": {
      ...viewTheme()
    },
    "UIComponent.MessageComponent": {
      ...messageComponent()
    },
    "NativeBase.TabHeading": {
      ...tabHeadingTheme()
    },
    "NativeBase.TabContainer": {
      ...tabContainerTheme()
    },
    "UIComponent.MessageDetailsInfoComponent": {
      ...messageDetailsInfoComponentTheme()
    },
    "UIComponent.PreferenceItem": {
      ...preferenceItemTheme()
    },
    "UIComponent.ScreenHeader": {
      ...screenHeaderTheme()
    },
    "UIComponent.FooterWithButtons": {
      ...footerWithButtonsTheme()
    },
    "NativeBase.ListItem": {
      ...listItemTheme()
    },
    "UIComponent.TopScreenComponent": {
      ...topScreenComponentTheme()
    }
  };

  // We need ad deep merge
  return merge(nbTheme, overrides);
};

export default theme;
