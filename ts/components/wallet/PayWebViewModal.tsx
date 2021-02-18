/**
 * webview component used to start a payment. A payment could start
 * - on credit card on-boarding
 * - on a regular payment
 * see https://docs.google.com/document/d/1FUkW7nwHlcmN2GrBWq1YnAzoNuvcvxa7WM0_VTkYV-I/edit#heading=h.v23dcgmq0ypp
 *
 * this is how this component works:
 * - at the start up, it creates a temporary html form with all data (props.formFata)
 * - it appends, at the end of that html, a script to auto-submit the created form to the given url (props.uri)
 * - it sets that html as starting page
 */
import WebView from "react-native-webview";
import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import _ from "lodash";
import I18n from "../../i18n";
import BaseScreenComponent from "../screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { RefreshIndicator } from "../ui/RefreshIndicator";
import { useHardwareBackButton } from "../../features/bonus/bonusVacanze/components/hooks/useHardwareBackButton";

type Props = {
  uri: string;
  formData: Record<string, string | number>;
  onGoBack: () => void;
};

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }
});

// a loading component rendered during the webview loading times
const renderLoading = () => (
  <View style={styles.refreshIndicatorContainer}>
    <RefreshIndicator />
  </View>
);
// the ID used as form ID and to identify it to ensure the autosubit
const formId = "IoFormID";
// the javascript submit command
const injectedJSPostForm: string = `<script type="application/javascript">document.getElementById("${formId}").submit();</script>`;

// create an html form giving a form data and an uri
const crateAutoPostForm = (
  form: Record<string, unknown>,
  uri: string
): string =>
  `<form action="${uri}" method="post" id="${formId}" enctype="multipart/form-data" style="display: none;">
    ${_.toPairs(form)
      .map(kv => `<input type="text" name="${kv[0]}" value="${kv[1]}">`)
      .join("<br/>")}
  </form>`;

export const PayWebViewModal = (props: Props) => {
  useHardwareBackButton(() => {
    props.onGoBack();
    return true;
  });

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={true}
      onRequestClose={props.onGoBack}
    >
      <BaseScreenComponent
        goBack={props.onGoBack}
        contextualHelp={emptyContextualHelp}
        headerTitle={I18n.t("wallet.saveCard.header")}
        faqCategories={["wallet_methods"]}
      >
        <WebView
          textZoom={100}
          source={{
            html:
              crateAutoPostForm(props.formData, props.uri) + injectedJSPostForm
          }}
          startInLoadingState={true}
          renderLoading={renderLoading}
          javaScriptEnabled={true}
        />
      </BaseScreenComponent>
    </Modal>
  );
};
