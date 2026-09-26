import pino from "pino";

function getTransport() {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }
  try {
    require.resolve("pino-pretty");
    return {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss.l o",
        ignore: "pid,hostname",
      },
    };
  } catch {
    return undefined;
  }
}

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: getTransport(),
});