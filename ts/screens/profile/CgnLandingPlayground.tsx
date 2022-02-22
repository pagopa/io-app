import { Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet, TextInput } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { Label } from "../../components/core/typography/Label";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import IconFont from "../../components/ui/IconFont";
import customVariables from "../../theme/variables";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { H5 } from "../../components/core/typography/H5";
import WebviewComponent from "../../components/WebviewComponent";

const styles = StyleSheet.create({
  textInput: { padding: 1, borderWidth: 1, height: 30 },
  center: { alignItems: "center" },
  contentCenter: { justifyContent: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  debugArea: {
    position: "absolute",
    bottom: 0,
    zIndex: 10,
    height: heightPercentageToDP("15%")
  }
});

const CgnLandingPlayground = () => {
  const [navigationURI, setNavigationUri] = React.useState("https://");
  const [refererValue, setRefererValue] = React.useState("");
  const [loadUri, setLoadUri] = React.useState("");
  const [reloadKey, setReloadKey] = React.useState(0);

  const handleUriInput = (text: string) => {
    setNavigationUri(text);
  };

  const handleRefererInput = (text: string) => {
    setRefererValue(text);
  };

  return (
    <BaseScreenComponent goBack={true}>
      <SafeAreaView style={IOStyles.flex}>
        <Content contentContainerStyle={IOStyles.flex}>
          <View>
            <H5>{"Link alla landing"}</H5>
            <TextInput
              style={styles.textInput}
              onChangeText={handleUriInput}
              value={navigationURI}
            />
            <View spacer={true} />
            <H5>{"Referer"}</H5>
            <TextInput
              style={styles.textInput}
              onChangeText={handleRefererInput}
              value={refererValue}
            />
          </View>
          <View spacer={true} />
          <View style={styles.row}>
            <ButtonDefaultOpacity
              style={styles.contentCenter}
              onPress={() => setReloadKey(r => r + 1)}
            >
              <Label color={"white"}>Reload</Label>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              style={styles.contentCenter}
              onPress={() => {
                setLoadUri(navigationURI);
              }}
            >
              <IconFont
                name={"io-right"}
                style={{
                  color: customVariables.colorWhite
                }}
              />
            </ButtonDefaultOpacity>
          </View>
          <View spacer={true} />
          <View style={IOStyles.flex}>
            {loadUri !== "" && (
              <WebviewComponent
                key={`${reloadKey}_webview`}
                source={{
                  uri: loadUri,
                  headers: {
                    referer: refererValue
                  }
                }}
              />
            )}
          </View>
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CgnLandingPlayground;
