import { Byte, formatByte } from "../digitalInformationUnit";

describe("formatDigitalInformationUnit", () => {
  jest.useFakeTimers();
  describe("When formatByte is called", () => {
    describe("And the argument is < 1024", () => {
      it("Should format using B", () => {
        const formatted0Bytes = formatByte(0 as Byte);
        expect(formatted0Bytes).toBe("0.00 B");
        const formattedBytes = formatByte(125 as Byte);
        expect(formattedBytes).toBe("125.00 B");
        const formatted1024Bytes = formatByte(1023 as Byte);
        expect(formatted1024Bytes).toBe("1,023.00 B");
      });
    });
    describe("And the argument is 1024 <= x < 1024*1024", () => {
      it("Should format using kB", () => {
        const formatted = formatByte(1024 as Byte);
        expect(formatted).toBe("1.00 kB");
        const formattedMax = formatByte((1024 * 1024 - 1) as Byte);
        expect(formattedMax).toBe("1,024.00 kB");
      });
    });
    describe("And the argument is 1024*1024 <= x < 1024*1024*1024", () => {
      it("Should format using MB", () => {
        const formatted = formatByte((1024 * 1024) as Byte);
        expect(formatted).toBe("1.00 MB");
        const formattedMax = formatByte((1024 * 1024 * 1024 - 1) as Byte);
        expect(formattedMax).toBe("1,024.00 MB");
      });
    });
    describe("And the argument is 1024*1024*1024 <= x < 1024*1024*1024*1024", () => {
      it("Should format using GB", () => {
        const formatted = formatByte((1024 * 1024 * 1024) as Byte);
        expect(formatted).toBe("1.00 GB");
        const formattedMax = formatByte(
          (1024 * 1024 * 1024 * 1024 - 1) as Byte
        );
        expect(formattedMax).toBe("1,024.00 GB");
      });
    });
    describe("And the argument is 1024*1024*1024*1024 <= x", () => {
      it("Should format using TB", () => {
        const formatted = formatByte((1024 * 1024 * 1024 * 1024) as Byte);
        expect(formatted).toBe("1.00 TB");
        const formatted1 = formatByte(
          (1024 * 1024 * 1024 * 1024 * 1024 * 1024) as Byte
        );
        expect(formatted1).toBe("1,048,576.00 TB");

        const formatted2 = formatByte(
          (1024 *
            1024 *
            1024 *
            1024 *
            1024 *
            1024 *
            1024 *
            1024 *
            1024 *
            1024 *
            1024 *
            1024) as Byte
        );
        expect(formatted2).toBe("1.2089258196146292e+24 TB");
      });
    });
  });
});
