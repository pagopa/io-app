import { Alert } from "react-native";
import { actionWithAlert } from "../ActionWithAlert";

describe("ActionWithAlert", () => {
  beforeAll(() => {
    jest.spyOn(Alert, "alert");
  });
  it("should render correctly with alert", () => {
    const onConfirmAction = jest.fn();
    actionWithAlert({
      title: "Test Title",
      body: "Test Message",
      confirmText: "Test Action",
      cancelText: "Cancel",
      onConfirmAction,
      completedFeedbackText: "Action completed"
    });
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Test Title",
      "Test Message",
      [
        { text: "Cancel" },
        {
          text: "Test Action",
          onPress: expect.any(Function),
          style: "cancel"
        }
      ],
      { cancelable: true }
    );

    // Simulate the confirm action
    const confirmAction = (Alert.alert as jest.Mock).mock.calls[0][2][1]
      .onPress;
    confirmAction();
    expect(onConfirmAction).toHaveBeenCalledTimes(1);
  });
});
