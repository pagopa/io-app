import { Content } from "native-base";
import * as React from "react";
import { View, SafeAreaView, StyleSheet, TextInput } from "react-native";
import { Label } from "../../components/core/typography/Label";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import IconFont from "../../components/ui/IconFont";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { H5 } from "../../components/core/typography/H5";
import WebviewComponent from "../../components/WebviewComponent";
import { IOColors } from "../../components/core/variables/IOColors";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Icon } from "../../components/core/icons/Icon";

const styles = StyleSheet.create({
  textInput: { padding: 1, borderWidth: 1, height: 30, color: IOColors.black },
  contentCenter: { justifyContent: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

const CgnLandingPlayground = () => {
  const [navigationURI, setNavigationUri] = React.useState("https://");
  const [refererValue, setRefererValue] = React.useState("");
  const [loadUri, setLoadUri] = React.useState("https://google.com");
  const [reloadKey, setReloadKey] = React.useState(0);

  return (
    <BaseScreenComponent goBack={true}>
      <SafeAreaView style={IOStyles.flex}>
        <Content contentContainerStyle={IOStyles.flex}>
          <View>
            <H5>{"Link alla landing"}</H5>
            <TextInput
              style={styles.textInput}
              onChangeText={setNavigationUri}
              value={navigationURI}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <VSpacer size={16} />
            <H5>{"Referer"}</H5>
            <TextInput
              style={styles.textInput}
              onChangeText={setRefererValue}
              value={refererValue}
            />
          </View>
          <VSpacer size={16} />
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
              <Icon name="chevronRight" size={24} color="white" />
            </ButtonDefaultOpacity>
          </View>
          <VSpacer size={16} />
          <View style={IOStyles.flex}>
            {loadUri !== "" && (
              <WebviewComponent
                key={`${reloadKey}_webview`}
                source={{
                  uri: loadUri,
                  headers: {
                    referer: refererValue,
                    "X-PagoPa-CGN-Referer": refererValue
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
