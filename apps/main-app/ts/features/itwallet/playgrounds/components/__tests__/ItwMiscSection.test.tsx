import { fireEvent, render } from "@testing-library/react-native";
import { useEffect } from "react";

import { backendStatusLoadSuccess } from "../../../../../store/actions/backendStatus";
import { useIODispatch } from "../../../../../store/hooks";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { withStore } from "../../../../../utils/jest/withStore";
import { ItwMiscSection } from "../ItwMiscSection";

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
            discover_more_ced_enabled: true
          }
        }
      })
    );
  }, [dispatch]);

  return <ItwMiscSection />;
});

test("the CED switch reflects and updates only the local preference when remotely enabled", () => {
  const { getByRole } = render(<TestComponent />);
  const getSwitch = () =>
    getByRole("switch", { name: "Scopri le opportunità della CED" });

  expect(getSwitch()).toHaveProp("value", false);

  fireEvent(getSwitch(), "valueChange", true);
  expect(getSwitch()).toHaveProp("value", true);

  fireEvent(getSwitch(), "valueChange", false);
  expect(getSwitch()).toHaveProp("value", false);
});
