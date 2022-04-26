import { responseFromJson } from "@chiselstrike/api";

import { GithubEvent } from "../models/GithubEvent";
import { log, LogLevel } from "../utils/log";
import { Handler, parseGithubHeaders } from "../utils/types";

// Events that need their branches to validated
const eventsToCheckBranches = new Set(["push"]);

const getHandler: Handler = async (req) => {
  const events = await GithubEvent.findMany({});
  return responseFromJson(events);
};

const isEventBranchValid = async (
  eventType: string,
  ref: string,
  projectBranches: string
): Promise<boolean> => {
  await log(
    LogLevel.INFO,
    `Checking if is event branch valid. ${JSON.stringify({
      eventType,
      ref,
      projectBranches,
    })}`
  );
  if (eventsToCheckBranches.has(eventType)) {
    await log(
      LogLevel.INFO,
      `Checking if the ${eventType} event has a valid target branch`
    );
    if (eventType === "push") {
      const splitRef = (ref as string).split("/");
      const refType = splitRef[1];
      if (refType == "heads") {
        const branch = splitRef.slice(2).join("/");
        if (!projectBranches.includes(branch)) {
          await log(
            LogLevel.INFO,
            `Branch ${branch} not included in target branches: ${projectBranches}`
          );
          return false;
        }
      } else {
        await log(
          LogLevel.INFO,
          `Not a 'heads' git ref, don't know what to do! Ignoring event...`
        );
        return false;
      }
    } else {
      await log(
        LogLevel.INFO,
        `Unsupported event ${eventType}. Ignoring event...`
      );
      return false;
    }
  }
  return true;
};

const postHandler: Handler = async (req) => {
  const { signature256, eventType, hookId, delivery } = parseGithubHeaders(
    req.headers
  );
  await log(
    LogLevel.INFO,
    `Received event with delivery id ${delivery} and type ${eventType} from Github`
  );
  const text = await req.text();

  const { ref, repository, organization, sender } = JSON.parse(text);
  let account = "";
  if (organization == null) {
    await log(
      LogLevel.INFO,
      `Event is not from an organization, using sender info`
    );
    account = sender.login;
  } else {
    await log(LogLevel.INFO, `Event is from an organization, using org info`);
    account = organization.login;
  }

  let projectBranches: string = ["main"].toString();

  if (!(await isEventBranchValid(eventType, ref, projectBranches))) {
    await log(LogLevel.INFO, `Event ignored!`);
    return new Response(`Event ignored!`, { status: 200 });
  }

  await log(LogLevel.INFO, `Saving event...`);
  const event = GithubEvent.build({
    type: eventType,
    contents: text,
    hookId: hookId,
    deliveryId: delivery,
    // TODO: remove this once this field is removed
    githubRepository: repository.name,
    account,
  });
  await event.save();
  await log(LogLevel.INFO, `Event saved!"`);
  return new Response(`Event created`, { status: 201 });
};

const handlers: Record<string, Handler> = {
  GET: getHandler,
  POST: postHandler,
};

export default async function (req: Request): Promise<Response> {
  if (handlers[req.method] != null) {
    return await handlers[req.method](req);
  }
  return new Response(`Unsupported method ${req.method}`, { status: 405 });
}
