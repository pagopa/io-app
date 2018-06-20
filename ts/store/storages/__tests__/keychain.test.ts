import createSecureStorage from "../keychain";

describe("keychain", () => {
  it("should set,get and remove a value correctly", async () => {
    const storage = createSecureStorage();

    // Set the value
    await storage.setItem("mykey", "myvalue");

    // Get the value and check it is the same
    const value1 = await storage.getItem("mykey");
    expect(value1).toEqual("myvalue");

    // Remove the value
    await storage.removeItem("mykey");

    // Try to get the value and check that undefined (not found) is returned
    const value2 = await storage.getItem("mykey");
    expect(value2).toBeUndefined();
  });
});
