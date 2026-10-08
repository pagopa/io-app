import { fireEvent, waitFor } from "@testing-library/react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import I18n from "i18next";
import { createStore } from "redux";

import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../../navigation/routes";
import {
  ItwPresentationCredentialAttachmentNavigationParams,
  ItwPresentationCredentialAttachmentScreen
} from "../ItwPresentationCredentialAttachmentScreen";

const mockToastShow = jest.fn();
const pdfDataUri = "data:application/pdf;base64,JVBERi0xLjQ=";
const mockFile = {
  delete: jest.fn(),
  exists: true,
  uri: "file:///tmp/io-cache/attachment.pdf",
  write: jest.fn()
};

jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn()
}));

jest.mock("expo-file-system", () => ({
  File: jest.fn(() => mockFile),
  Paths: { cache: { uri: "file:///tmp/io-cache/" } }
}));

jest.mock("react-native-pdf", () => jest.fn(() => null));

jest.mock("@io-app/design-system", () => ({
  ...jest.requireActual<typeof import("@io-app/design-system")>(
    "@io-app/design-system"
  ),
  useIOToast: () => ({
    show: mockToastShow
  })
}));

describe("ItwPresentationCredentialAttachmentScreen", () => {
  beforeEach(() => {
    jest.mocked(File).mockReturnValue(mockFile as unknown as File);
    jest.mocked(Sharing.shareAsync).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("writes the PDF data URI to a temporary file and shares its local URI", async () => {
    const { getByText } = renderComponent({
      attachmentClaim: {
        name: "  ../Health/Card\\\u0000.pdf",
        value: pdfDataUri
      }
    });

    fireEvent.press(
      getByText(I18n.t("features.itWallet.presentation.ctas.shareButton"))
    );

    await waitFor(() => {
      expect(File).toHaveBeenCalledWith(Paths.cache, "HealthCard.pdf");
      expect(mockFile.write).toHaveBeenCalledWith(
        Uint8Array.from("%PDF-1.4", character => character.charCodeAt(0))
      );
      expect(Sharing.shareAsync).toHaveBeenCalledWith(mockFile.uri, {
        mimeType: "application/pdf",
        dialogTitle: "HealthCard.pdf"
      });
      expect(mockFile.delete).toHaveBeenCalled();
    });
  });

  it("uses a fallback filename when the claim name has no usable characters", async () => {
    const { getByText } = renderComponent({
      attachmentClaim: {
        name: " ./\\\u0000.pdf",
        value: pdfDataUri
      }
    });

    fireEvent.press(
      getByText(I18n.t("features.itWallet.presentation.ctas.shareButton"))
    );

    await waitFor(() => {
      expect(File).toHaveBeenCalledWith(Paths.cache, "attachment.pdf");
      expect(Sharing.shareAsync).toHaveBeenCalledWith(mockFile.uri, {
        mimeType: "application/pdf",
        dialogTitle: "attachment.pdf"
      });
    });
  });

  it("shows the generic error content when the attachment claim is unsupported", () => {
    const component = renderComponent({
      attachmentClaim: {
        name: "unsupported",
        value: "not-a-pdf"
      }
    });

    expect(component).toMatchSnapshot();
  });

  it("shows a toast and cleans up the temporary file when sharing fails", async () => {
    jest.mocked(Sharing.shareAsync).mockRejectedValueOnce(new Error("fail"));

    const { getByText } = renderComponent({
      attachmentClaim: {
        name: "attachment.pdf",
        value: pdfDataUri
      }
    });

    fireEvent.press(
      getByText(I18n.t("features.itWallet.presentation.ctas.shareButton"))
    );

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        I18n.t("messagePDFPreview.errors.sharing")
      );
      expect(mockFile.delete).toHaveBeenCalled();
    });
  });
});

const renderComponent = (
  routeParams: ItwPresentationCredentialAttachmentNavigationParams
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));

  const mockNavigation = new Proxy(
    {},
    {
      get: _ => jest.fn()
    }
  ) as unknown as IOStackNavigationProp<
    ItwParamsList,
    "ITW_PRESENTATION_CREDENTIAL_ATTACHMENT"
  >;

  const route = {
    key: "ITW_PRESENTATION_CREDENTIAL_ATTACHMENT",
    name: ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT,
    params: routeParams
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwPresentationCredentialAttachmentScreen
        navigation={mockNavigation}
        route={route}
      />
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT,
    routeParams,
    createStore(appReducer, initialState as any)
  );
};
