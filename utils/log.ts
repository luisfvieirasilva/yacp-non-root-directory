import { Logs } from "../models/Logs";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export async function log(level: LogLevel, content: string): Promise<void> {
  const newLog = Logs.build({ level, content, createdAt: new Date().toISOString() });
  await newLog.save();
}
