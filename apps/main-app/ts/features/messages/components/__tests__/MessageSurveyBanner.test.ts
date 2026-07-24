import { fireEvent } from "@testing-library/react-native";
import { createElement, type ReactElement } from "react";
import { createStore } from "redux";

import { MessageCategory } from "../../../../../definitions/communication/MessageCategory";
import { TagEnum as BaseTagEnum } from "../../../../../definitions/communication/MessageCategoryBase";
import { TagEnum as PaymentTagEnum } from "../../../../../definitions/communication/MessageCategoryPayment";
import { ThirdPartyAttachment } from "../../../../../definitions/communication/ThirdPartyAttachment";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { applicationChangeState } from "../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../store/actions/backendStatus";
import { type Action } from "../../../../store/actions/types";
import { appReducer } from "../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../store/reducers/__mock__/backendStatus";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { openWebUrl } from "../../../../utils/url";
import { PNMessage } from "../../../pn/store/types/types";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { service_1 } from "../../__mocks__/messages";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { loadMessageDetails, loadThirdPartyMessage } from "../../store/actions";
import { UIMessage, UIMessageDetails } from "../../types";
import { ATTACHMENT_CATEGORY } from "../../types/attachmentCategory";
import { ThirdPartyMessageUnion } from "../../types/thirdPartyById";
import {
  SendMessageSurveyBanner,
  StandardMessageSurveyBanner,
  testable
} from "../MessageSurveyBanner";

jest.mock("../../../../utils/url");

const {
  MessageKind,
  MessageSurveyBanner,
  encodeQualtricsParameters,
  messageKindFromStandardMessage
} = testable!;

const QUALTRICS_URI =
  "https://pagopa.qualtrics.com/jfe/form/SV_0VCZTkYbfozt9ki";
const PAYMENT_RPT_ID = "01234567890123456789012345678";
const MESSAGE_SURVEY_BANNER_TEST_ID = "message-survey-banner";

const qualtricsParameters = {
  organizationFiscalCode: "Comune di Tokyo",
  serviceId: "service-id" as ServiceId,
  sendingDate: "2026-06-18T10:30:00.000Z",
  messageType: MessageKind.STANDARD
};

const messageId = "01JYW0BM2FSGPP8M5RM8V72WJ8";
const createdAt = new Date("2026-06-18T10:30:00.000Z");
const standardMessage: UIMessage = {
  id: messageId,
  category: { tag: BaseTagEnum.GENERIC },
  createdAt,
  serviceId: service_1.id,
  serviceName: service_1.name,
  organizationName: service_1.organization.name,
  organizationFiscalCode: service_1.organization.fiscal_code,
  isRead: true,
  isArchived: false,
  title: "A message title",
  hasPrecondition: false
};
const sendMessage = {
  created_at: createdAt
} as PNMessage;
const loadedMessageDetails = {
  id: messageId,
  hasRemoteContent: false
} as UIMessageDetails;

describe("encodeQualtricsParameters", () => {
  it("should append the UTF-8 base64url encoded parameters", () => {
    const encodedParameters = encodeQualtricsParameters(
      QUALTRICS_URI,
      qualtricsParameters
    );
    const parametersBase64Url = Buffer.from(
      JSON.stringify(qualtricsParameters),
      "utf8"
    ).toString("base64url");

    expect(encodedParameters).toBe(
      `${QUALTRICS_URI}?Q_EED=${parametersBase64Url}`
    );
    expect(encodedParameters).not.toContain("%3D");
    expect(parametersBase64Url).not.toContain("=");
    expect(parametersBase64Url).not.toMatch(/[+/]/);
  });
});

describe("messageKindFromStandardMessage", () => {
  const genericCategory = { tag: BaseTagEnum.GENERIC } as MessageCategory;
  const paymentCategory = {
    tag: PaymentTagEnum.PAYMENT,
    rptId: PAYMENT_RPT_ID
  } as MessageCategory;
  const paymentData = {} as UIMessageDetails["paymentData"];
  const getMessageKind = ({
    category = genericCategory,
    details = {} as Partial<UIMessageDetails>,
    hasAttachments = false
  } = {}) =>
    messageKindFromStandardMessage(
      { category } as UIMessage,
      {
        hasRemoteContent: false,
        ...details
      } as UIMessageDetails,
      hasAttachments
    );

  const scenarios = [
    {
      name: "standard message without loaded detail flags",
      expected: MessageKind.STANDARD
    },
    {
      name: "remote content takes precedence over payments and attachments",
      category: paymentCategory,
      details: {
        hasRemoteContent: true,
        paymentData
      },
      hasAttachments: true,
      expected: MessageKind.REMOTE_CONTENT
    },
    {
      name: "loaded attachments take precedence over payments",
      category: paymentCategory,
      details: { paymentData },
      hasAttachments: true,
      expected: MessageKind.ATTACHMENT
    },
    {
      name: "payment category",
      category: paymentCategory,
      expected: MessageKind.PAYMENT
    },
    {
      name: "loaded payment data with stale generic category",
      details: { paymentData },
      expected: MessageKind.PAYMENT
    },
    {
      name: "loaded attachments with generic category",
      hasAttachments: true,
      expected: MessageKind.ATTACHMENT
    },
    {
      name: "loaded remote content with generic category",
      details: { hasRemoteContent: true },
      expected: MessageKind.REMOTE_CONTENT
    }
  ];

  test.each(scenarios)(
    "should return $expected for $name",
    ({ expected, name, ...scenario }) => {
      const messageKind = getMessageKind(scenario);

      expect(messageKind).toBe(expected);
    }
  );
});

describe("MessageSurveyBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when the feedback uri is not configured", () => {
    const { queryByTestId } = renderComponent();
    const surveyBanner = queryByTestId(MESSAGE_SURVEY_BANNER_TEST_ID);

    expect(surveyBanner).toBeNull();
  });

  it("should render the survey banner when the feedback uri is configured", () => {
    const { getByTestId } = renderComponent({ qualtricsUri: QUALTRICS_URI });
    const surveyBanner = getByTestId(MESSAGE_SURVEY_BANNER_TEST_ID);

    expect(surveyBanner).toBeTruthy();
  });

  it("should open the encoded survey url when the action is pressed", () => {
    const { getByTestId } = renderComponent({ qualtricsUri: QUALTRICS_URI });
    const surveyBanner = getByTestId(MESSAGE_SURVEY_BANNER_TEST_ID);

    fireEvent.press(surveyBanner);

    expect(openWebUrl).toHaveBeenCalledWith(
      encodeQualtricsParameters(QUALTRICS_URI, qualtricsParameters)
    );
  });
});

describe("StandardMessageSurveyBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when message details are not loaded", () => {
    const { queryByTestId } = renderWithState(
      createElement(StandardMessageSurveyBanner, { message: standardMessage }),
      [backendStatusWithSurveyUri()]
    );
    const surveyBanner = queryByTestId(MESSAGE_SURVEY_BANNER_TEST_ID);

    expect(surveyBanner).toBeNull();
  });

  it("should open the survey url with standard message parameters", () => {
    const { getByTestId } = renderWithState(
      createElement(StandardMessageSurveyBanner, { message: standardMessage }),
      [
        backendStatusWithSurveyUri(),
        loadMessageDetails.success(loadedMessageDetails)
      ]
    );
    const surveyBanner = getByTestId(MESSAGE_SURVEY_BANNER_TEST_ID);

    fireEvent.press(surveyBanner);

    expect(openWebUrl).toHaveBeenCalledWith(
      encodeQualtricsParameters(QUALTRICS_URI, {
        organizationFiscalCode: service_1.organization.fiscal_code,
        serviceId: service_1.id,
        sendingDate: createdAt.toISOString(),
        messageType: MessageKind.STANDARD
      })
    );
  });

  it("should open the survey url with attachment message parameters", () => {
    const { getByTestId } = renderWithState(
      createElement(StandardMessageSurveyBanner, { message: standardMessage }),
      [
        backendStatusWithSurveyUri(),
        loadMessageDetails.success(loadedMessageDetails),
        loadThirdPartyMessage.success({
          id: messageId,
          content: thirdPartyMessageWithAttachments
        })
      ]
    );
    const surveyBanner = getByTestId(MESSAGE_SURVEY_BANNER_TEST_ID);

    fireEvent.press(surveyBanner);

    expect(openWebUrl).toHaveBeenCalledWith(
      encodeQualtricsParameters(QUALTRICS_URI, {
        organizationFiscalCode: service_1.organization.fiscal_code,
        serviceId: service_1.id,
        sendingDate: createdAt.toISOString(),
        messageType: MessageKind.ATTACHMENT
      })
    );
  });
});

describe("SendMessageSurveyBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when service details are not loaded", () => {
    const { queryByTestId } = renderWithState(
      createElement(SendMessageSurveyBanner, {
        message: sendMessage,
        serviceId: service_1.id
      }),
      [backendStatusWithSurveyUri()]
    );
    const surveyBanner = queryByTestId(MESSAGE_SURVEY_BANNER_TEST_ID);

    expect(surveyBanner).toBeNull();
  });

  it("should open the survey url with SEND message parameters", () => {
    const { getByTestId } = renderWithState(
      createElement(SendMessageSurveyBanner, {
        message: sendMessage,
        serviceId: service_1.id
      }),
      [backendStatusWithSurveyUri(), loadServiceDetail.success(service_1)]
    );
    const surveyBanner = getByTestId(MESSAGE_SURVEY_BANNER_TEST_ID);

    fireEvent.press(surveyBanner);

    expect(openWebUrl).toHaveBeenCalledWith(
      encodeQualtricsParameters(QUALTRICS_URI, {
        organizationFiscalCode: service_1.organization.fiscal_code,
        serviceId: service_1.id,
        sendingDate: createdAt.toISOString(),
        messageType: MessageKind.SEND
      })
    );
  });
});

const renderComponent = ({ qualtricsUri }: { qualtricsUri?: string } = {}) => {
  const actions = qualtricsUri
    ? [backendStatusWithSurveyUri(qualtricsUri)]
    : [];

  return renderWithState(
    createElement(MessageSurveyBanner, qualtricsParameters),
    actions
  );
};

const backendStatusWithSurveyUri = (qualtricsUri = QUALTRICS_URI) =>
  backendStatusLoadSuccess({
    ...baseRawBackendStatus,
    config: {
      ...baseRawBackendStatus.config,
      messages_feedback_banner: {
        feedback_uri: qualtricsUri,
        min_app_version: {
          android: "0.0.1",
          ios: "0.0.1"
        }
      }
    }
  });

const renderWithState = (
  component: ReactElement,
  actions: ReadonlyArray<Action> = []
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const state = actions.reduce(appReducer, initialState);
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext(
    () => component,
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};

const attachment = {
  id: "attachment-id",
  category: ATTACHMENT_CATEGORY.DOCUMENT,
  url: "https://example.com/attachment.pdf"
} as ThirdPartyAttachment;

const thirdPartyMessageWithAttachments = {
  kind: "TPM",
  third_party_message: {
    attachments: [attachment]
  }
} as unknown as ThirdPartyMessageUnion;
