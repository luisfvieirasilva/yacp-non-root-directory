import { responseFromJson } from "@chiselstrike/api";
import { log, LogLevel } from "../utils/log";

type Handler = (req: Request, res: Response) => Response | Promise<Response>

const handleGet: Handler = async req => {
  await log(LogLevel.INFO, `Sending hello to ${req.headers["referer"]}`);
  return responseFromJson({hello: "Hello 2022-04-26 12:04"})
}

const handlers: Record<string, Handler> = {
  GET: handleGet,
}

export default async function chisel(req: Request, res: Response) {
  if (handlers[req.method] === undefined)
    return new Response(`Unsupported method ${req.method}`, { status: 405 })
  return handlers[req.method](req, res)
}
