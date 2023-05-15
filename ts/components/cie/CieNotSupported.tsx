import { Body, List, ListItem } from "native-base";
import * as React from "react";
import { useState } from "react";
import { Platform, View } from "react-native";
import I18n from "../../i18n";
import { VSpacer } from "../core/spacer/Spacer";
import Markdown from "../ui/Markdown";
import { IOIcons, Icon } from "../core/icons";
import { IOColors } from "../core/variables/IOColors";

type Props = {
  hasCieApiLevelSupport: boolean;
  hasCieNFCFeature: boolean;
};

const ICON_SIZE = 24;
const okColor: IOColors = "green";
const koColor: IOColors = "red";
const okIcon: IOIcons = "ok";
const koIcon: IOIcons = "legError";
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
