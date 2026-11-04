import { z } from "zod";

/**
 * Represent the log mode for the CIE SDK
 *
 * - 'ENABLED': Logs are enabled and will be printed using the standard print
 *   function.
 * - `FILE`: Logs are saved to a local file on the device, allowing for later
 *   retrieval and analysis.
 * - `CONSOLE`: Logs are output to the system console for real-time monitoring.
 * - `DISABLED`: Disables all logging
 *
 * **Note**: Logging is only supported on iOS. On Android, setting the log mode
 * will throw an error.
 */
export const LogMode = z.enum(["ENABLED", "FILE", "CONSOLE", "DISABLED"]);

export type LogMode = z.infer<typeof LogMode>;
