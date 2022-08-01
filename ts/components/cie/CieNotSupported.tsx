import { Body, List, ListItem, Text, View } from "native-base";
import * as React from "react";
import { useState } from "react";
import { Platform } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import IconFont from "../ui/IconFont";
import Markdown from "../ui/Markdown";

type Props = {
  hasCieApiLevelSupport: boolean;
  hasCieNFCFeature: boolean;
};

const ICON_SIZE = 24;
const okColor = customVariables.brandSuccess;
const koColor = customVariables.brandDanger;
const okIcon = "io-complete";
const koIcon = "io-error";
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
          <View spacer={true} />
          <Markdown onLoadEnd={handleMarkdownLoaded}>
            {I18n.t("authentication.landing.cie_unsupported.android_desc")}
          </Markdown>
          <View spacer={true} extralarge={true} />
          {markdownLoaded === markDownElements && (
            <List>
              <ListItem>
                <IconFont
                  name={props.hasCieApiLevelSupport ? okIcon : koIcon}
                  size={ICON_SIZE}
                  color={props.hasCieApiLevelSupport ? okColor : koColor}
                />
                <Body>
                  <Text>
                    {I18n.t(
                      "authentication.landing.cie_unsupported.os_version_unsupported"
                    )}
                  </Text>
                </Body>
              </ListItem>
              <ListItem>
                <IconFont
                  style={{ alignItems: "flex-start" }}
                  name={props.hasCieNFCFeature ? okIcon : koIcon}
                  size={ICON_SIZE}
                  color={props.hasCieNFCFeature ? okColor : koColor}
                />
                <Body>
                  <Text>
                    {I18n.t(
                      "authentication.landing.cie_unsupported.nfc_incompatible"
                    )}
                  </Text>
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
