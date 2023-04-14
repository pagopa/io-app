import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import React, { useCallback } from "react";
import { View, SafeAreaView, StyleSheet, TextInput } from "react-native";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { maybeNotNullyString } from "../../../utils/strings";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import ButtonSolid from "../../../components/ui/ButtonSolid";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import { sessionTokenSelector } from "../../../store/reducers/authentication";
import { LollipopBackendClient } from "../api/backend";
import { useIOSelector } from "../../../store/hooks";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../store/reducers/lollipop";
import { toThumbprint } from "../utils/crypto";

const styles = StyleSheet.create({
  textInput: {
    padding: 1,
    borderWidth: 1,
    height: 120
  },
  column: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch"
  }
});

const LollipopPlayground = () => {
  const [httpRequestBodyText, setHttpRequestBodyText] =
    React.useState<string>("");

  const keyTag = useIOSelector(lollipopKeyTagSelector);
  const maybePublicKey = useIOSelector(lollipopPublicKeySelector);
  const maybeSessionToken = O.fromNullable(useIOSelector(sessionTokenSelector));

  const lollipopClient =
    O.isSome(maybeSessionToken) && O.isSome(keyTag) && O.isSome(maybePublicKey)
      ? LollipopBackendClient(
          "https://api-app.io.pagopa.it",
          maybeSessionToken.value,
          {
            keyTag: keyTag.value,
            publicKey: maybePublicKey.value,
            publicKeyThumbprint: toThumbprint(maybePublicKey)
          }
        )
      : undefined;

  const onSignButtonPress = useCallback(
    async (body: string) => {
      if (lollipopClient) {
        const bodyMessage = {
          message: body
        };
        try {
          const response = await lollipopClient.postSignMessage({
            nonce: "aNonce"
          })(bodyMessage);
          console.log("🔑 response: " + JSON.stringify(maybePublicKey));
          console.log("✅ response: " + JSON.stringify(response));
        } catch (e) {
          console.log("❌ error: " + JSON.stringify(e));
        }
      }
    },
    [lollipopClient, maybePublicKey]
  );

  console.log("✅ refreshing");

  const isMessageBodySet = O.isSome(maybeNotNullyString(httpRequestBodyText));
  return (
    <BaseScreenComponent goBack={true} headerTitle={"Lollipop Playground"}>
      <SafeAreaView style={IOStyles.flex}>
        <Content contentContainerStyle={IOStyles.flex}>
          <View style={styles.column}>
            <TextInput
              multiline={true}
              placeholder={"paste here your body message"}
              style={styles.textInput}
              onChangeText={setHttpRequestBodyText}
              value={httpRequestBodyText}
            />
            <VSpacer size={16} />
            <View style={styles.row}>
              <ButtonSolid
                accessibilityLabel="Sign body message"
                label={"Sign body message"}
                disabled={!isMessageBodySet}
                onPress={() => onSignButtonPress(httpRequestBodyText)}
              />
              <HSpacer size={16} />
              <ButtonOutline
                accessibilityLabel="Clear"
                label={"Clear"}
                disabled={!isMessageBodySet}
                onPress={() => setHttpRequestBodyText("")}
              />
            </View>
          </View>
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default LollipopPlayground;
