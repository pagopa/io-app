import * as O from "fp-ts/lib/Option";
import { fireEvent } from "@testing-library/react-native";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { ScrollView } from "react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { MessageDetailsBody } from "../MessageDetailsBody";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";

jest.mock("../MessageMarkdown");
jest.mock("../../../../../components/IOMarkdown");

jest.mock("react-native-device-info", () => ({
  getReadableVersion: () => "2.0.0.0",
  getVersion: () => "2.0.0.0",
  isDisplayZoomed: () => false
}));

const serviceId = "01JRAEYE4SKF5BEW41J9H9NWFM" as ServiceId;
const invalidCTAMarkdown =
  '---\nit:\n  cta_1:\ntext: "Questo è il testo"\n    action: ioit://messages\nen:\n  cta_1:\ntext: "This is the text"\n    action: ioit://messages\n---\nThis is a mesage with an invalid CTA';

describe("MessageDetailsBody", () => {
  [false, true].forEach(ioMarkdownEnabled => {
    it(`should match snapshot for message with no CTA (${
      ioMarkdownEnabled ? "IOMarkdown" : "Old Markdown"
    })`, () => {
      const component = renderComponent(
        ioMarkdownEnabled,
        "This is a mesage with no CTA"
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`should match snapshot for message with CTA (${
      ioMarkdownEnabled ? "IOMarkdown" : "Old Markdown"
    })`, () => {
      const component = renderComponent(
        ioMarkdownEnabled,
        '---\nit:\n  cta_1:\n    text: "Questo è il testo"\n    action: ioit://messages\nen:\n  cta_1:\n    text: "This is the text"\n    action: ioit://messages\n---\nThis is a mesage with a CTA'
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });
  it(`should match snapshot for message with invalid CTA`, () => {
    const component = renderComponent(true, invalidCTAMarkdown);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should show an Alert for a message with invalid CTA. The alert should be pressable and display the raw content (upong pushing) and hide it again later", () => {
    const component = renderComponent(true, invalidCTAMarkdown);

    // This throws if the component is not found, so there is no need to assert
    const alert = component.getByTestId("markdown-decoding-error-alert");

    const rawBodyOnHidden = component.queryByTestId(
      "markdown-decoding-error-raw"
    );
    expect(rawBodyOnHidden).toBe(null);

    // Show raw body
    fireEvent.press(alert);

    // This throws if the component is not found, so there is no need to assert
    component.getByTestId("markdown-decoding-error-raw");

    // Hide raw body
    const alertAfterShow = component.getByTestId(
      "markdown-decoding-error-alert"
    );
    fireEvent.press(alertAfterShow);

    const rawBodyAfterShowHide = component.queryByTestId(
      "markdown-decoding-error-raw"
    );
    expect(rawBodyAfterShowHide).toBe(null);
  });
});

const renderComponent = (ioMarkdownEnabled: boolean, markdown: string) => {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const globalState = {
    ...baseState,
    remoteConfig: O.some({
      cgn: {
        enabled: false
      },
      ioMarkdown: {
        min_app_version: {
          android: ioMarkdownEnabled ? "1.0.0.0" : "3.0.0.0",
          ios: ioMarkdownEnabled ? "1.0.0.0" : "3.0.0.0"
        }
      }
    })
  } as GlobalState;
  const mockStore = configureMockStore<GlobalState>();
  const store: Store<GlobalState> = mockStore(globalState);

  const mockScrollViewRef = {
    current: {} as ScrollView
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <MessageDetailsBody
        messageMarkdown={markdown}
        scrollViewRef={mockScrollViewRef}
        serviceId={serviceId}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
