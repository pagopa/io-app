import { fireEvent, render } from "@testing-library/react-native";
import { useEffect } from "react";

import { backendStatusLoadSuccess } from "../../../../../store/actions/backendStatus";
import { useIODispatch } from "../../../../../store/hooks";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import * as appVersion from "../../../../../utils/appVersion";
import { withStore } from "../../../../../utils/jest/withStore";
import { ItwMiscSection } from "../ItwMiscSection";

afterEach(() => jest.restoreAllMocks());

const TestComponent = withStore(() => {
  const dispatch = useIODispatch();

  useEffect(() => {
    dispatch(
      backendStatusLoadSuccess({
        ...baseRawBackendStatus,
        config: {
          ...baseRawBackendStatus.config,
          itw: {
            ...baseRawBackendStatus.config.itw,
            discover_more_ced: {
              min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" }
            }
          }
        }
      })
    );
  }, [dispatch]);

  return <ItwMiscSection />;
});

test("the CED switch reflects and updates only the local preference when remotely enabled", () => {
  jest.spyOn(appVersion, "getAppVersion").mockReturnValue("2.0.0.0");
  const { getByRole } = render(<TestComponent />);
  const getSwitch = () =>
    getByRole("switch", { name: "Scopri le opportunità della CED" });

  expect(getSwitch()).toHaveProp("value", false);

  fireEvent(getSwitch(), "valueChange", true);
  expect(getSwitch()).toHaveProp("value", true);

  fireEvent(getSwitch(), "valueChange", false);
  expect(getSwitch()).toHaveProp("value", false);
});
