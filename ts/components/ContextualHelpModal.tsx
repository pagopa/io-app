import { fromNullable, none } from "fp-ts/lib/Option";
import { BugReporting } from "instabug-reactnative";
import * as pot from "italia-ts-commons/lib/pot";
import { Container } from "native-base";
import * as React from "react";
import { InteractionManager, Modal, ModalBaseProps } from "react-native";
import { connect } from "react-redux";
import { loadContextualHelpData } from "../store/actions/content";
import { Dispatch } from "../store/actions/types";
import { screenContextualHelpDataSelector } from "../store/reducers/content";
import { GlobalState } from "../store/reducers/types";
import {
  isLoggedIn,
  supportTokenSelector,
  SupportTokenState
} from "../store/reducers/authentication";
import { loadSupportToken } from "../store/actions/authentication";
import { remoteUndefined } from "../features/bonus/bpd/model/RemoteValue";
import {
  FAQsCategoriesType,
  FAQType,
  getFAQsFromCategories
} from "../utils/faq";
import Markdown from "./ui/Markdown";
import SendSupportTokenInfo from "./SendSupportTokenInfo";
import ContextualHelpComponent from "./ContextualHelpComponent";

type OwnProps = Readonly<{
  title: string;
  body: () => React.ReactNode;
  contentLoaded: boolean;
  isVisible: boolean;
  onLinkClicked?: (url: string) => void;
  modalAnimation?: ModalBaseProps["animationType"];
  close: () => void;
  onRequestAssistance: (
    type: BugReporting.reportType,
    supportToken: SupportTokenState
  ) => void;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

export type ContextualHelpData = {
  title: string;
  content: React.ReactNode;
  faqs?: ReadonlyArray<FAQType>;
};

/**
 * A modal to show the contextual help reelated to a screen.
 * The contextual help is characterized by:
 * - a title
 * - a textual or a component containing the screen description
 * - [optional] if on SPID authentication once the user selected an idp, content to link the support desk of the selected identity provider
 * - a list of questions and answers. They are selected by the component depending on the cathegories passed to the component
 *
 * Optionally, the title and the content are injected from the content presented in the related clinet response.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
const ContextualHelpModal: React.FunctionComponent<Props> = (props: Props) => {
  const [content, setContent] = React.useState<React.ReactNode>(null);
  const [contentLoaded, setContentLoaded] = React.useState<boolean | undefined>(
    undefined
  );
  const [showSendPersonalInfo, setShowSendPersonalInfo] = React.useState<
    boolean
  >(false);

  const [supportType, setSupportType] = React.useState<
    BugReporting.reportType | undefined
  >(undefined);

  React.useEffect(() => {
    // if the contextual data is empty or is in error -> try to reload
    if (
      !pot.isLoading(props.potContextualData) &&
      pot.isNone(props.potContextualData) &&
      pot.isError(props.potContextualData)
    ) {
      props.loadContextualHelpData();
    }
    // refresh / load support token
    props.loadSupportToken();
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
    setShowSendPersonalInfo(false);
  };

  /**
    If contextualData (loaded from the content server) contains the route of the current screen,
    title, content, faqs are read from it, otherwise they came from the locales stored in app
   */
  const contextualHelpData = props.maybeContextualData.fold<ContextualHelpData>(
    {
      title: props.title,
      faqs: getFAQsFromCategories(props.faqCategories ?? []),
      content
    },
    data => {
      const content = (
        <Markdown onLoadEnd={() => setContentLoaded(true)}>
          {data.content}
        </Markdown>
      );
      const faqs = fromNullable(data.faqs)
        // ensure the array is defined and not empty
        .mapNullable(faqs => (faqs.length > 0 ? faqs : undefined))
        // if remote faqs are not defined or empty, fallback to the local ones
        .fold(getFAQsFromCategories(props.faqCategories ?? []), fqs =>
          fqs.map(f => ({ title: f.title, content: f.body }))
        );
      return { title: data.title, content, faqs };
    }
  );

  /**
    content is loaded is when:
    - provided one from props is loaded or
    - when the remote one is loaded
   */
  const isContentLoaded = props.maybeContextualData.fold(
    props.contentLoaded,
    _ => contentLoaded
  );

  /**
   * If the user is authenticated we show the screen that allows to choice or not to send the personal token
   * to the assistance.
   * Otherwise we allow the user to open directly a new assistance request without sending the personal token.
   * @param reportType
   */
  const handleOnRequestAssistance = (reportType: BugReporting.reportType) => {
    if (props.isAuthenticated) {
      setShowSendPersonalInfo(true);
      setSupportType(reportType);
      return;
    }
    props.onRequestAssistance(reportType, props.supportToken);
  };

  /**
   * If an authenticated user choice to send the personal token we send it to the assistance.
   * Otherwise we allow the user to open a new assistance request without sending the personal token.
   * @param type
   * @param sendSupportToken
   */
  const handleSendSupportTokenInfoContinue = (sendSupportToken: boolean) => {
    setShowSendPersonalInfo(false);
    fromNullable(supportType).map(st => {
      props.onRequestAssistance(
        st,
        sendSupportToken ? props.supportToken : remoteUndefined
      );
    });
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
        {showSendPersonalInfo ? (
          <SendSupportTokenInfo
            onClose={onClose}
            onGoBack={() => setShowSendPersonalInfo(false)}
            onContinue={handleSendSupportTokenInfoContinue}
          />
        ) : (
          <ContextualHelpComponent
            onClose={onClose}
            contextualHelpData={contextualHelpData}
            isContentLoaded={isContentLoaded}
            onRequestAssistance={handleOnRequestAssistance}
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
  loadSupportToken: () => dispatch(loadSupportToken.request())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextualHelpModal);
