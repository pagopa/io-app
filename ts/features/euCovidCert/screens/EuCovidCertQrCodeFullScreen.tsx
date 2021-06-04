import { View } from "native-base";
import * as React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

type NavigationParams = Readonly<{
  qrCodeContent: string;
}>;

const styles = StyleSheet.create({
  qrCode: {
    // TODO: it's preferable to use useWindowDimensions, but we need to upgrade react native
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").width,
    flex: 1
  }
});

export const EuCovidCertQrCodeFullScreen = (
  props: NavigationInjectedProps<NavigationParams>
): React.ReactElement => (
  <BaseScreenComponent goBack={true}>
    <SafeAreaView style={IOStyles.flex} testID={"EuCovidCertQrCodeFullScreen"}>
      <ScrollView>
        <View spacer={true} extralarge={true} />
        <View spacer={true} extralarge={true} />
        <Image
          source={{
            uri: `data:image/png;base64,${props.navigation.getParam(
              "qrCodeContent"
            )}`
          }}
          style={styles.qrCode}
        />
      </ScrollView>
      {/* {props.footer} */}
    </SafeAreaView>
  </BaseScreenComponent>
);
