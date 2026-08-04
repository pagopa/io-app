import { IOThemeContextProvider } from "@io-app/design-system";
import { fireEvent, render } from "@testing-library/react-native";
import _ from "lodash";
import MockDate from "mockdate";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { getType } from "typesafe-actions";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import * as bottomSheet from "../../../../../utils/hooks/bottomSheet";
import { getCredentialStatus } from "../../../common/utils/itwCredentialStatusUtils";
import {
  CredentialFormat,
  CredentialMetadata
} from "../../../common/utils/itwTypesUtils";
import { itwCredentialsStore } from "../../../credentials/store/actions";
import { applyStatusToCredential } from "../../utils/itwDebugCredentialUtils";
import { ItwCredentialStatusOverrideSection } from "../ItwCredentialStatusOverrideSection";

const NOW = new Date(2026, 6, 24, 12);
const mockBottomSheetPresent = jest.fn();

const createCredential = (
  credentialId: string,
  credentialType: string,
  format: CredentialFormat
): CredentialMetadata => ({
  credentialId,
  credentialType,
  format,
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    expiration: "2030-01-01T00:00:00.000Z",
    issuedAt: "2026-01-01T00:00:00.000Z"
  },
  keyTag: `${credentialId}-key-tag`,
  parsedCredential: {
    expiry_date: {
      name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
      value: "2030-01-01"
    }
  },
  spec_version: "1.3.3"
});

const pid = createCredential("dc_sd_jwt_pid", "pid", CredentialFormat.SD_JWT);
const mdlSdJwt = createCredential(
  "dc_sd_jwt_mDL",
  "mDL",
  CredentialFormat.SD_JWT
);
const mdlLegacySdJwt = createCredential(
  "vc_sd_jwt_mDL",
  "mDL",
  CredentialFormat.LEGACY_SD_JWT
);
const mdlMdoc = createCredential("mso_mdoc_mDL", "mDL", CredentialFormat.MDOC);
const disabilityCard = createCredential(
  "dc_sd_jwt_EuropeanDisabilityCard",
  "EuropeanDisabilityCard",
  CredentialFormat.SD_JWT
);

const allCredentials = [pid, mdlSdJwt, mdlLegacySdJwt, mdlMdoc, disabilityCard];

const getState = (
  env: "pre" | "prod",
  credentials: ReadonlyArray<CredentialMetadata>
): GlobalState => {
  const initialState = appReducer(undefined, applicationChangeState("active"));

  return _.merge({}, initialState, {
    features: {
      itWallet: {
        credentials: {
          credentials: Object.fromEntries(
            credentials.map(credential => [credential.credentialId, credential])
          )
        },
        environment: { env }
      }
    }
  });
};

const renderSection = (
  env: "pre" | "prod",
  credentials: ReadonlyArray<CredentialMetadata>
) => {
  const store = createStore(appReducer, getState(env, credentials) as any);
  const dispatchSpy = jest.spyOn(store, "dispatch");
  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <IOThemeContextProvider theme="light">{children}</IOThemeContextProvider>
    </Provider>
  );

  return {
    ...render(<ItwCredentialStatusOverrideSection />, { wrapper: Wrapper }),
    dispatchSpy,
    store
  };
};

describe("ItwCredentialStatusOverrideSection", () => {
  beforeAll(() => {
    MockDate.set(NOW);
  });

  beforeEach(() => {
    jest.spyOn(bottomSheet, "useIOBottomSheetModal").mockImplementation(
      ({ component }) =>
        ({
          bottomSheet: component,
          dismiss: jest.fn(),
          present: mockBottomSheetPresent
        }) as ReturnType<typeof bottomSheet.useIOBottomSheetModal>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    MockDate.reset();
  });

  it("is only available in the PRE environment", () => {
    const prodComponent = renderSection("prod", allCredentials);

    expect(prodComponent.queryByText("Status Override (PRE only)")).toBeNull();

    prodComponent.unmount();
    const preComponent = renderSection("pre", allCredentials);

    expect(preComponent.getByText("Status Override (PRE only)")).toBeTruthy();
  });

  it("is not rendered when there are no credentials", () => {
    const component = renderSection("pre", []);

    expect(component.queryByText("Status Override (PRE only)")).toBeNull();
  });

  it("renders one row per credential type without a No override option", () => {
    const component = renderSection("pre", allCredentials);

    expect(component.getAllByText("mDL")).toHaveLength(1);
    fireEvent.press(component.getByText("mDL"));
    expect(component.queryByText("No override")).toBeNull();
  });

  it("derives the displayed status from the representative credential", () => {
    const expiredMdl = applyStatusToCredential(mdlSdJwt, "jwtExpired");
    const component = renderSection("pre", [expiredMdl, mdlMdoc]);

    expect(component.getByText("jwtExpired")).toBeTruthy();
    fireEvent.press(component.getByText("mDL"));
    expect(
      component.getByTestId("RadioItemTestID_jwtExpired").props
        .accessibilityState
    ).toMatchObject({ checked: true });
  });

  it("updates every representation with a single credential store action", () => {
    const component = renderSection("pre", allCredentials);

    fireEvent.press(component.getByText("mDL"));
    fireEvent.press(component.getByText("jwtExpired"));

    expect(mockBottomSheetPresent).toHaveBeenCalledTimes(1);
    expect(component.dispatchSpy).toHaveBeenCalledTimes(1);

    const dispatchedAction = component.dispatchSpy.mock.calls[0][0];
    expect(dispatchedAction.type).toBe(getType(itwCredentialsStore));

    if (dispatchedAction.type !== getType(itwCredentialsStore)) {
      throw new Error("Unexpected dispatched action");
    }

    expect(
      dispatchedAction.payload.map(credential => credential.credentialId)
    ).toEqual([
      mdlSdJwt.credentialId,
      mdlLegacySdJwt.credentialId,
      mdlMdoc.credentialId
    ]);
    expect(
      dispatchedAction.payload.map(credential =>
        getCredentialStatus(credential)
      )
    ).toEqual(["jwtExpired", "jwtExpired", "jwtExpired"]);

    const storedCredentials =
      component.store.getState().features.itWallet.credentials.credentials;
    expect(storedCredentials[pid.credentialId]).toEqual(pid);
    expect(storedCredentials[disabilityCard.credentialId]).toEqual(
      disabilityCard
    );
  });
});
