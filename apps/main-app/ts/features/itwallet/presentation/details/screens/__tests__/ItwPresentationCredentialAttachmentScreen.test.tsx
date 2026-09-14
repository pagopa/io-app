import { fireEvent, waitFor } from "@testing-library/react-native";
import * as Sharing from "expo-sharing";
import I18n from "i18next";
import RNFS from "react-native-fs";
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
const mockCachesDirectoryPath = "/tmp/io-cache";
const pdfDataUri = "data:application/pdf;base64,JVBERi0xLjQ=";

jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn()
}));

jest.mock("react-native-fs", () => ({
  get CachesDirectoryPath() {
    return mockCachesDirectoryPath;
  },
  exists: jest.fn(),
  unlink: jest.fn(),
  writeFile: jest.fn()
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
    jest.mocked(RNFS.writeFile).mockResolvedValue(undefined);
    jest.mocked(RNFS.exists).mockResolvedValue(true);
    jest.mocked(RNFS.unlink).mockResolvedValue(undefined);
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
      expect(RNFS.writeFile).toHaveBeenCalledWith(
        `${mockCachesDirectoryPath}/HealthCard.pdf`,
        "JVBERi0xLjQ=",
        "base64"
      );
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        `file://${mockCachesDirectoryPath}/HealthCard.pdf`,
        {
          mimeType: "application/pdf",
          dialogTitle: "HealthCard.pdf"
        }
      );
      expect(RNFS.unlink).toHaveBeenCalledWith(
        `${mockCachesDirectoryPath}/HealthCard.pdf`
      );
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
      expect(RNFS.writeFile).toHaveBeenCalledWith(
        `${mockCachesDirectoryPath}/attachment.pdf`,
        "JVBERi0xLjQ=",
        "base64"
      );
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        `file://${mockCachesDirectoryPath}/attachment.pdf`,
        {
          mimeType: "application/pdf",
          dialogTitle: "attachment.pdf"
        }
      );
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
      expect(RNFS.unlink).toHaveBeenCalledWith(
        `${mockCachesDirectoryPath}/attachment.pdf`
      );
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
