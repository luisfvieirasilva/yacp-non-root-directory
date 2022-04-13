import { responseFromJson } from "@chiselstrike/api"
import { BlogComment } from "../models/BlogComment"

type Handler = (req: Request, res: Response) => Response | Promise<Response>

const handleGet: Handler = async req => {
// hello
  return responseFromJson({hello: "world github"})
}

const handlers: Record<string, Handler> = {
  GET: handleGet,
}

export default async function chisel(req: Request, res: Response) {
  if (handlers[req.method] === undefined)
    return new Response(`Unsupported method ${req.method}`, { status: 405 })
  return handlers[req.method](req, res)
}
