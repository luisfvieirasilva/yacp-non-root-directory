import { responseFromJson } from "@chiselstrike/api";
import { log, LogLevel } from "../utils/log";

const helloString = "Hello - random branch - 2022-04-27 18:02";

type Handler = (req: Request, res: Response) => Response | Promise<Response>

const handleGet: Handler = async req => {
  return responseFromJson({hello: helloString})
}

const handlePost: Handler = async req => {
  await log(LogLevel.INFO, `Sending hello to ${req.headers["referer"]}`);
  return responseFromJson({hello: helloString})
}

const handlers: Record<string, Handler> = {
  GET: handleGet,
  POST: handlePost,
}

export default async function chisel(req: Request, res: Response) {
  if (handlers[req.method] === undefined)
    return new Response(`Unsupported method ${req.method}`, { status: 405 })
  return handlers[req.method](req, res)
}
