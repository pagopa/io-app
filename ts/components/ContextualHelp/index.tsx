import React, { useEffect, useState } from "react";
import { InteractionManager, Modal, ModalBaseProps } from "react-native";
import { connect } from "react-redux";
import { fromNullable, none, Option } from "fp-ts/lib/Option";
import { BugReporting } from "instabug-reactnative";
import * as pot from "italia-ts-commons/lib/pot";
import { Container } from "native-base";

import { ScreenCHData } from "../../../definitions/content/ScreenCHData";
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
import { FAQsCategoriesType, getFAQsFromCategories } from "../../utils/faq";
import { instabugReportOpened } from "../../store/actions/debug";
import Markdown from "../ui/Markdown";

import SendSupportRequestOptions, {
  SupportRequestOptions
} from "./SendSupportRequestOptions";
import ContextualHelpComponent, {
  ContextualHelpData
} from "./ContextualHelpComponent";

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
  onLinkClicked?: (url: string) => void;
  onRequestAssistance: (payload: RequestAssistancePayload) => void;
  shouldAskForScreenshotWithInitialValue?: boolean;
  title: string;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

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
const ContextualHelp: React.FunctionComponent<Props> = (props: Props) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [contentHasLoaded, setContentHasLoaded] = useState<boolean | undefined>(
    undefined
  );
  const [authenticatedSupportType, setAuthenticatedSupportType] =
    useState<BugReporting.reportType | null>(null);

  const { potContextualData, loadContextualHelpData } = props;

  useEffect(() => {
    // if the contextual data is empty or is in error -> try to reload
    if (
      !pot.isLoading(potContextualData) &&
      pot.isNone(potContextualData) &&
      pot.isError(potContextualData)
    ) {
      loadContextualHelpData();
    }
  }, [potContextualData, loadContextualHelpData]);

  // after the modal is fully visible, render the content -
  // in case of complex markdown this can take some time and we don't
  // want to impact the modal animation
  const onModalShow = () => setContent(props.body());

  // on close, we set a handler to cleanup the content after all
  // interactions (animations) are complete
  const onClose = () => {
    void InteractionManager.runAfterInteractions(() => setContent(null));
    props.close();
    setAuthenticatedSupportType(null);
  };

  const contextualHelpData: ContextualHelpData = getContextualHelpData(
    props.maybeContextualData,
    {
      title: props.title,
      faqs: getFAQsFromCategories(props.faqCategories ?? []),
      content
    },
    () => setContentHasLoaded(true)
  );

  /**
    content is loaded when:
    - provided one from props is loaded or
    - when the remote one is loaded
   */
  const isContentLoaded = props.maybeContextualData.fold(
    props.contentLoaded,
    _ => contentHasLoaded
  );

  const initRequestAssistance = (supportType: BugReporting.reportType) => {
    // ask to send the personal information to the assistance only for a new bug.
    if (props.isAuthenticated && supportType === BugReporting.reportType.bug) {
      // refresh / load support token
      props.loadSupportToken();
      setAuthenticatedSupportType(supportType);
    } else {
      finalizeRequestAssistance({
        supportType,
        supportToken: props.supportToken
      });
    }
  };

  const finalizeRequestAssistance = (payload: RequestAssistancePayload) => {
    props.dispatchOpenReportType(payload.supportType);
    props.onRequestAssistance(payload);
  };

  /**
   * Authenticated request is a two-steps procedure: first, we ask the permission to use
   * personal data. Second, we actually submit the request.
   */
  const handleContinueWithOptions = (options: SupportRequestOptions) => {
    finalizeRequestAssistance({
      supportType: options.supportType,
      supportToken: options.sendPersonalInfo
        ? props.supportToken
        : remoteUndefined,
      shouldSendScreenshot: options.sendScreenshot
    });
    setAuthenticatedSupportType(null);
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
        {authenticatedSupportType ? (
          <SendSupportRequestOptions
            onClose={onClose}
            onGoBack={() => {
              if (authenticatedSupportType) {
                setAuthenticatedSupportType(null);
              }
            }}
            onContinue={handleContinueWithOptions}
            shouldAskForScreenshotWithInitialValue={
              props.shouldAskForScreenshotWithInitialValue
            }
            supportType={authenticatedSupportType}
          />
        ) : (
          <ContextualHelpComponent
            onClose={onClose}
            onLinkClicked={onClose}
            contextualHelpData={contextualHelpData}
            isContentLoaded={isContentLoaded}
            onRequestAssistance={initRequestAssistance}
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

export default connect(mapStateToProps, mapDispatchToProps)(ContextualHelp);
