import { Body, List, ListItem, Text, View } from "native-base";
import * as React from "react";
import { Platform } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import IconFont from "../ui/IconFont";
import Markdown from "../ui/Markdown";

type Props = {
  hasCieApiLevelSupport: boolean;
  hasCieNFCFeature: boolean;
};

const ICON_SIZE = 16;

const CieNotSupported: React.FunctionComponent<Props> = props => {
  return (
    <React.Fragment>
      <Markdown>
        {I18n.t("authentication.landing.cie_unsupported.body")}
      </Markdown>
      {Platform.OS === "android" && (
        <React.Fragment>
          <View spacer={true} />
          <Markdown>
            {I18n.t("authentication.landing.cie_unsupported.android_desc")}
          </Markdown>
          <View spacer={true} extralarge={true} />
          <List>
            <ListItem>
              <IconFont
                name="io-tick-big"
                size={ICON_SIZE}
                color={
                  props.hasCieApiLevelSupport
                    ? customVariables.brandLightGray
                    : customVariables.contentPrimaryBackground
                }
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
                name="io-tick-big"
                size={ICON_SIZE}
                color={
                  props.hasCieNFCFeature
                    ? customVariables.brandLightGray
                    : customVariables.contentPrimaryBackground
                }
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
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default CieNotSupported;
