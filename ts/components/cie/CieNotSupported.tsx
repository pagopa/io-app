import { List, ListItem } from "native-base";
import * as React from "react";
import { useState } from "react";
import { Platform, View } from "react-native";
import {
  IOColors,
  IOIcons,
  Icon,
  HSpacer,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../i18n";
import Markdown from "../ui/Markdown";
import { Body } from "../core/typography/Body";

type Props = {
  hasCieApiLevelSupport: boolean;
  hasCieNFCFeature: boolean;
};

const ICON_SIZE = 24;
const okColor: IOColors = "green";
const koColor: IOColors = "red";
const okIcon: IOIcons = "ok";
const koIcon: IOIcons = "errorFilled";
const markDownElements = 2;
const CieNotSupported: React.FunctionComponent<Props> = props => {
  const [markdownLoaded, setMarkdownLoaded] = useState(0);
  const handleMarkdownLoaded = () => setMarkdownLoaded(s => s + 1);
  return (
    <React.Fragment>
      <Markdown onLoadEnd={handleMarkdownLoaded}>
        {I18n.t("authentication.landing.cie_unsupported.body")}
      </Markdown>

      {Platform.OS === "android" && (
        <React.Fragment>
          <VSpacer size={16} />
          <Markdown onLoadEnd={handleMarkdownLoaded}>
            {I18n.t("authentication.landing.cie_unsupported.android_desc")}
          </Markdown>
          <VSpacer size={40} />
          {markdownLoaded === markDownElements && (
            <List>
              <ListItem>
                <Icon
                  size={ICON_SIZE}
                  name={props.hasCieApiLevelSupport ? okIcon : koIcon}
                  color={props.hasCieApiLevelSupport ? okColor : koColor}
                />
                <HSpacer size={8} />
                <Body>
                  {I18n.t(
                    "authentication.landing.cie_unsupported.os_version_unsupported"
                  )}
                </Body>
              </ListItem>
              <ListItem>
                <View style={{ alignItems: "flex-start" }}>
                  <Icon
                    size={ICON_SIZE}
                    name={props.hasCieNFCFeature ? okIcon : koIcon}
                    color={props.hasCieNFCFeature ? okColor : koColor}
                  />
                </View>
                <HSpacer size={8} />
                <Body>
                  {I18n.t(
                    "authentication.landing.cie_unsupported.nfc_incompatible"
                  )}
                </Body>
              </ListItem>
            </List>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default CieNotSupported;
