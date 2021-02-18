import WebView from "react-native-webview";
import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import _ from "lodash";
import { fromNullable, Option } from "fp-ts/lib/Option";
import uuid from "uuid/v4";
import { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import BaseScreenComponent from "../screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { RefreshIndicator } from "../ui/RefreshIndicator";
import { useHardwareBackButton } from "../../features/bonus/bonusVacanze/components/hooks/useHardwareBackButton";

type Props = {
  // the uri to send the form data thought POST
  postUri: string;
  // data to include into the form to submit
  formData: Record<string, string | number>;
  /**
   * the path name that means the end of the process
   * ex: the process ends when this url will be load https://yourdomain.com/finish/path/name
   * finishPathName should be "/finish/path/name"
   */
  finishPathName: string;
  /**
   * the name of the query param used to include the outcome code
   * ex: https://yourdomain.com/finish/path/name?myoutcome=123
   * outcomeQueryparamName should be "myoutcome"
   */
  outcomeQueryparamName: string;
  onFinish: (outcomeCode: Option<string>) => void;
  onGoBack: () => void;
  modalHeaderTitle?: string;
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
const formId = `io-form-id-${uuid()}`;
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

/**
 * A modal including a webview component.
 * It must be used to handle a payment.
 * A payment could start
 * - on credit card on-boarding
 * - on a regular payment
 * see https://docs.google.com/document/d/1FUkW7nwHlcmN2GrBWq1YnAzoNuvcvxa7WM0_VTkYV-I/edit#heading=h.v23dcgmq0ypp
 *
 * this is how this component works:
 * - at the start up, it creates a temporary html hidden form with all pre-set data (props.formFata)
 * - it appends, at the end of that html, a JS script to auto-submit the created form to the given url (props.postUri)
 * - it sets that html as starting page
 * - on each page load request it checks the url
 *    - if it is the exit url
 *    - if it contains the outcome code
 * - when the the exit url is found, it doens't load it and call the handler props.onFinish passing the found (maybe not) outcome value
 */
export const PayWebViewModal = (props: Props) => {
  const [outcomeCode, setOutcomeCode] = React.useState<string | undefined>(
    undefined
  );
  useHardwareBackButton(() => {
    props.onGoBack();
    return true;
  });

  const handleOnShouldStartLoadWithRequest = (navState: WebViewNavigation) => {
    if (navState.url) {
      const url = new URLParse(navState.url, true);
      const outcome = url.query[props.outcomeQueryparamName] ?? outcomeCode;
      if (outcome !== outcomeCode) {
        setOutcomeCode(outcome);
      }
      // found exit path
      if (
        url.pathname.toLowerCase().includes(props.finishPathName.toLowerCase())
      ) {
        props.onFinish(fromNullable(outcome));
        return false;
      }
    }
    return true;
  };

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
        headerTitle={props.modalHeaderTitle}
      >
        <WebView
          textZoom={100}
          source={{
            html:
              crateAutoPostForm(props.formData, props.postUri) +
              injectedJSPostForm
          }}
          onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
          startInLoadingState={true}
          renderLoading={renderLoading}
          javaScriptEnabled={true}
        />
      </BaseScreenComponent>
    </Modal>
  );
};
