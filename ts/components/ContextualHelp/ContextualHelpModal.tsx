import { fromNullable, none } from "fp-ts/lib/Option";
import { BugReporting } from "instabug-reactnative";
import * as pot from "italia-ts-commons/lib/pot";
import { Container } from "native-base";
import React, { useEffect, useState } from "react";
import { InteractionManager, Modal, ModalBaseProps, Text } from "react-native";
import DeviceInfo from "react-native-device-info";
import { connect } from "react-redux";
import { Option } from "fp-ts/lib/Option";

import { loadContextualHelpData } from "../../store/actions/content";
import { Dispatch } from "../../store/actions/types";
import { screenContextualHelpDataSelector } from "../../store/reducers/content";
import { GlobalState } from "../../store/reducers/types";
import {
  isLoggedIn,
  supportTokenSelector,
  SupportTokenState
} from "../../store/reducers/authentication";
import { loadSupportToken } from "../../store/actions/authentication";
import { remoteUndefined } from "../../features/bonus/bpd/model/RemoteValue";
import {
  FAQsCategoriesType,
  FAQType,
  getFAQsFromCategories
} from "../../utils/faq";
import { instabugReportOpened } from "../../store/actions/debug";
import Markdown from "../ui/Markdown";
import SendSupportRequestOptions, {
  SupportRequestOptions
} from "./SendSupportRequestOptions";
import ContextualHelpComponent, {
  ContextualHelpData
} from "./ContextualHelpComponent";
import { ScreenCHData } from "../../../definitions/content/ScreenCHData";

export type RequestAssistancePayload = {
  supportType: BugReporting.reportType;
  supportToken: SupportTokenState;
  deviceUniqueId?: string;
  shouldSendScreenshot?: boolean | undefined;
};

type OwnProps = Readonly<{
  body: () => React.ReactNode;
  close: () => void;
  contentLoaded: boolean;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  isVisible: boolean;
  modalAnimation?: ModalBaseProps["animationType"];
  onRequestAssistance: (payload: RequestAssistancePayload) => void;
  shouldAskForScreenshotWithInitialValue?: boolean;
  title: string;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

type ContextualHelpData = any;
/**
 If contextualData (loaded from the content server) contains the route of the current screen,
 title, content, faqs are read from it, otherwise they came from the locales stored in app
 */
const getContextualHelpData = (
  maybeContextualData: Option<ScreenCHData>,
  defaultData: ContextualHelpData,
  onReady: () => void
): ContextualHelpData =>
  maybeContextualData.fold<ContextualHelpData>(defaultData, data => ({
    title: data.title,
    content: <Markdown onLoadEnd={onReady}>{data.content}</Markdown>,
    faqs: fromNullable(data.faqs)
      // ensure the array is defined and not empty
      .mapNullable(faqs => (faqs.length > 0 ? faqs : undefined))
      // if remote faqs are not defined or empty, fallback to the local ones
      .fold(defaultData.faqs, fqs =>
        fqs.map(f => ({ title: f.title, content: f.body }))
      )
  }));

/**
 * A modal to show the contextual help related to a screen.
 * The contextual help is characterized by:
 * - a title
 * - a textual or a component containing the screen description
 * - [optional] if on SPID authentication once the user selected an idp, content to link the support desk of the selected identity provider
 * - a list of questions and answers. They are selected by the component depending on the cathegories passed to the component
 *
 * Optionally, the title and the content are injected from the content presented in the related clinet response.
 */
const ContextualHelpModal: React.FunctionComponent<Props> = (props: Props) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [contentLoaded, setContentLoaded] = useState<boolean | undefined>(
    undefined
  );

  type AssistanceRequestStep =
    | { _tag: "idle" } // show ContextualHelpComponent
    | { _tag: "begin"; readonly supportType: BugReporting.reportType } // show Send..
    | { _tag: "end" };
  const [assistanceRequestStep, setAssistanceRequestStep] = useState<
    AssistanceRequestStep
  >({ _tag: "idle" });

  // const [supportType, setSupportType] = useState< BugReporting.reportType | undefined >(undefined);

  useEffect(() => {
    // if the contextual data is empty or is in error -> try to reload
    if (
      !pot.isLoading(props.potContextualData) &&
      pot.isNone(props.potContextualData) &&
      pot.isError(props.potContextualData)
    ) {
      props.loadContextualHelpData();
    }
  }, [
    pot.isNone(props.potContextualData) || pot.isError(props.potContextualData)
  ]);

  // after the modal is fully visible, render the content -
  // in case of complex markdown this can take some time and we don't
  // want to impact the modal animation
  const onModalShow = () => setContent(props.body());

  // on close, we set a handler to cleanup the content after all
  // interactions (animations) are complete
  const onClose = () => {
    void InteractionManager.runAfterInteractions(() => setContent(null));
    props.close();
    setAssistanceRequestStep({ _tag: "end" });
  };

  const contextualHelpData: ContextualHelpData = getContextualHelpData(
    props.maybeContextualData,
    {
      title: props.title,
      faqs: getFAQsFromCategories(props.faqCategories ?? []),
      content
    },
    () => setContentLoaded(true)
  );

  /**
    content is loaded when:
    - provided one from props is loaded or
    - when the remote one is loaded
   */
  const isContentLoaded = props.maybeContextualData.fold(
    props.contentLoaded,
    _ => contentLoaded
  );

  /**
   * If the user is authenticated and is a new request we show the screen that allows to choose or not to send the personal token
   * to the assistance.
   * Otherwise we allow the user to open directly a the assistance request (new or not) without sending the personal token.
   */
  const startRequestAssistance = (supportType: BugReporting.reportType) => {
    // ask to send the personal information to the assistance only for a new bug.
    if (props.isAuthenticated && supportType === BugReporting.reportType.bug) {
      // refresh / load support token
      props.loadSupportToken();
      setAssistanceRequestStep({ _tag: "begin", supportType });
    } else {
      endRequestAssistance({
        supportType,
        supportToken: props.supportToken
      });
    }
  };

  const endRequestAssistance = (payload: RequestAssistancePayload) => {
    props.dispatchOpenReportType(payload.supportType);
    props.onRequestAssistance(payload);
    setAssistanceRequestStep({ _tag: "end" });
  };

  /**
   * If an authenticated user chooses to send the personal data we send it to the assistance.
   * Otherwise we allow the user to open a new assistance request without sending the personal data.
   *
   * @param options Contains the checkboxes' values, @todo handle screenshot attachment request.
   */
  const handleContinue = (options: SupportRequestOptions) => {
    if (assistanceRequestStep._tag === "begin") {
      const { supportType } = assistanceRequestStep;
      endRequestAssistance({
        supportType,
        supportToken: options.sendPersonalInfo
          ? props.supportToken
          : remoteUndefined,
        deviceUniqueId: options.sendPersonalInfo
          ? DeviceInfo.getUniqueId()
          : undefined,
        shouldSendScreenshot: options.sendScreenshot
      });
    }
  };

  return (
    <Modal
      visible={props.isVisible}
      onShow={onModalShow}
      animationType={props.modalAnimation || "slide"}
      transparent={true}
      onDismiss={onClose}
      onRequestClose={onClose}
    >
      <Container>
        {(assistanceRequestStep._tag === "idle" ||
          assistanceRequestStep._tag === "end") && (
          <ContextualHelpComponent
            onClose={onClose}
            onLinkClicked={onClose}
            contextualHelpData={contextualHelpData}
            isContentLoaded={isContentLoaded}
            onRequestAssistance={startRequestAssistance}
          />
        )}
        {assistanceRequestStep._tag === "begin" && (
          <SendSupportRequestOptions
            onClose={onClose}
            onGoBack={() => setAssistanceRequestStep({ _tag: "idle" })}
            onContinue={handleContinue}
            shouldAskForScreenshotWithInitialValue={
              props.shouldAskForScreenshotWithInitialValue
            }
          />
        )}
      </Container>
    </Modal>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const potContextualData = screenContextualHelpDataSelector(state);
  const maybeContextualData = pot.getOrElse(potContextualData, none);
  const isAuthenticated = isLoggedIn(state.authentication);

  const supportToken = supportTokenSelector(state);
  return {
    supportToken,
    potContextualData,
    maybeContextualData,
    isAuthenticated
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadContextualHelpData: () => dispatch(loadContextualHelpData.request()),
  loadSupportToken: () => dispatch(loadSupportToken.request()),
  dispatchOpenReportType: (type: BugReporting.reportType) =>
    dispatch(instabugReportOpened({ type }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextualHelpModal);
