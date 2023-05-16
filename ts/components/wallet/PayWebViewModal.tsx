import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import WebView from "react-native-webview";
import { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import { v4 as uuid } from "uuid";

import { InfoBox } from "../../components/box/InfoBox";
import { Label } from "../../components/core/typography/Label";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import I18n from "../../i18n";
import { WithTestID } from "../../types/WithTestID";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { isTestEnv } from "../../utils/environment";
import BaseScreenComponent from "../screens/BaseScreenComponent";
import { RefreshIndicator } from "../ui/RefreshIndicator";

type OwnProps = {
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
  // outcomeCode could be the outcome code detected during navigation
  // navigations urls is the list of urls browsed during navigation
  onFinish: (
    outcomeCode: O.Option<string>,
    navigationUrls: ReadonlyArray<string>
  ) => void;
  onGoBack: () => void;
  modalHeaderTitle?: string;
  // if undefined -> true as default
  showInfoHeader?: boolean;
  // if undefined -> true as default
  isVisible?: boolean;
};

type Props = WithTestID<OwnProps>;

const styles = StyleSheet.create({
  descriptionContainer: { paddingHorizontal: 20, paddingVertical: 14 },
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

// the ID used as form ID and to identify it to ensure the autosubmit
const formId = `io-form-id-${uuid()}`;
// the javascript submit command
const injectedJSPostForm: string = `<script type="application/javascript">document.getElementById("${formId}").submit();</script>`;

const kvToString = (kv: [string, unknown]) =>
  `<input type="text" name="${kv[0]}" value="${kv[1]}">`;

// create an html form giving a form data and an uri
const crateAutoPostForm = (
  form: Record<string, unknown>,
  uri: string
): string =>
  `<html><body><form action="${uri}" method="post" id="${formId}" enctype="application/x-www-form-urlencoded" style="display: none;">
    ${_.toPairs(form).map(kvToString).join("<br/>")}
  </form></body></html>`;

/**
 * return a 2-tuple
 * 0 element: boolean. true if the given {@param urlParse} contains the given {@param finishPathName} path name
 * 1 element: string | undefined. a string contains the value of {@param outcomeQueryparamName} in query string of {@param url}
 * @param urlParse
 * @param finishPathName
 * @param outcomeQueryparamName
 */
const getFinishAndOutcome = (
  urlParse: URLParse,
  finishPathName: string,
  outcomeQueryparamName: string
): [isFinish: boolean, outComeCode: string | undefined] => {
  // find the object entry name in case insensitive
  const maybeEntry = _.toPairs(urlParse.query).find(
    kv => kv[0].toLowerCase() === outcomeQueryparamName.toLowerCase()
  );
  const outcome = maybeEntry ? maybeEntry[1] : undefined;
  // found exit path
  if (urlParse.pathname.toLowerCase().includes(finishPathName.toLowerCase())) {
    return [true, outcome];
  }
  return [false, outcome];
};

// a loading component rendered during the webview loading times
const renderLoading = () => (
  <View style={styles.refreshIndicatorContainer}>
    <RefreshIndicator />
  </View>
);

/**
 * A modal including a webview component.
 * It must be used to handle a payment.
 * A payment could happen
 * - on credit card on-boarding (2cents fake payment as pre-authorization)
 * - on a regular payment
 * https://pagopa.atlassian.net/wiki/spaces/IOAPP/pages/404457605/Pagamento
 *
 * this is how this component works:
 * - at the start up, it creates a temporary html hidden form with all pre-set data (props.formFata)
 * - it appends, at the end of that html, a JS script to auto-submit the created form to the given url (props.postUri)
 * - it sets that html as starting page
 * - on each page load request it checks the url
 *    - if it is the exit url
 *    - if it contains the outcome code
 * - when the exit url is found, it doesn't load it and call the handler props.onFinish passing the found (maybe not) outcome value
 */
export const PayWebViewModal = (props: Props) => {
  const [outcomeCode, setOutcomeCode] = React.useState<string | undefined>(
    undefined
  );
  const { showInfoHeader = true } = props;
  const navigationUrlsRef = React.useRef<Array<string>>([]);
  useHardwareBackButton(() => {
    props.onGoBack();
    return true;
  });

  const handleOnShouldStartLoadWithRequest = (navState: WebViewNavigation) => {
    if (navState.url) {
      const urlParse = new URLParse(navState.url, true);
      // it happens when navState.url is "about:blank"
      // i.e when we load local html
      if (urlParse.origin !== "null") {
        // eslint-disable-next-line functional/immutable-data
        navigationUrlsRef.current.push(urlParse.origin);
      }

      const [isFinish, maybeOutcome] = getFinishAndOutcome(
        urlParse,
        props.finishPathName,
        props.outcomeQueryparamName
      );
      const outcome = maybeOutcome ?? outcomeCode;
      if (outcome !== outcomeCode) {
        setOutcomeCode(outcome);
      }
      // found exit path
      if (isFinish) {
        props.onFinish(O.fromNullable(outcome), navigationUrlsRef.current);
        return false;
      }
    }
    return true;
  };

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={props.isVisible ?? true}
      onRequestClose={props.onGoBack}
    >
      <BaseScreenComponent
        goBack={props.onGoBack}
        contextualHelp={emptyContextualHelp}
        headerTitle={props.modalHeaderTitle}
      >
        {showInfoHeader && (
          <View
            style={styles.descriptionContainer}
            testID={"PayWebViewModal-description"}
          >
            <InfoBox iconName="info" iconColor="bluegreyDark" iconSize={24}>
              <Label weight={"Regular"} color={"bluegrey"}>
                {I18n.t("wallet.challenge3ds.description")}
              </Label>
            </InfoBox>
          </View>
        )}

        <WebView
          testID={props.testID}
          textZoom={100}
          source={{
            html:
              crateAutoPostForm(props.formData, props.postUri) +
              injectedJSPostForm
          }}
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
          startInLoadingState={true}
          renderLoading={renderLoading}
          javaScriptEnabled={true}
        />
      </BaseScreenComponent>
    </Modal>
  );
};

// keep encapsulation strong
export const testableGetFinishAndOutcome = isTestEnv
  ? getFinishAndOutcome
  : undefined;
