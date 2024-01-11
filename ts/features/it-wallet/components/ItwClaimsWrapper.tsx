import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { H6, IOColors } from "@pagopa/io-app-design-system";
import {
  CredentialCatalogDisplay,
  getImageFromCredentialType
} from "../utils/itwMocksUtils";

/**
 * Props of the component.
 * @param displayData - the display data of the credential.
 * @param children - the children of the component.
 * @param type - the credential type.
 */
type Props = {
  displayData: CredentialCatalogDisplay;
  children: React.ReactNode;
  type: string;
};

/**
 * Const used to set the border radius of the body and the ImageBackground component.
 */
const BORDER_RADIUS = 16;

/**
 * Renders a wrapper for the claims of a credential which shows an header with background image and title.
 */
const ItwClaimsWrapper = ({ displayData, children, type }: Props) => (
  <>
    <View style={styles.body}>
      <ImageBackground
        source={getImageFromCredentialType(type)}
        style={styles.backgroundImage}
      >
        <View style={styles.header}>
          <H6 color={displayData.textColor}>{displayData.title}</H6>
        </View>
      </ImageBackground>
      <View style={styles.container}>{children}</View>
    </View>
  </>
);

const styles = StyleSheet.create({
  header: {
    padding: 24
  },
  backgroundImage: {
    height: 72,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    overflow: "hidden"
  },
  body: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: IOColors.white,
    shadowColor: IOColors.bluegreyDark,
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.0,
    elevation: 4
  },
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16
  }
});

export default ItwClaimsWrapper;
