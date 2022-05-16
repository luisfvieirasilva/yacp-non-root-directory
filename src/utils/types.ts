export type Handler = (req: Request) => Response | Promise<Response>;

export type GithubWebhookHeaders = {
  accept: string;
  'accept-encoding': string;
  'content-length': string;
  'content-type': string;
  host: string;
  'user-agent': string;
  'x-forwarded-for': string;
  'x-forwarded-proto': string;
  'x-github-delivery': string;
  'x-github-event': string;
  'x-github-hook-id': string;
  'x-github-hook-installation-target-id': string;
  'x-github-hook-installation-target-type': string;
  'x-hub-signature': string;
  'x-hub-signature-256': string;
};

type GithubWebhookParsedHeaders = {
  eventType: string;
  installationId: string;
  delivery: string;
  hookId: string;
  signature: string;
  signature256: string;
};

export const parseGithubHeaders = (
  headers: Headers,
): GithubWebhookParsedHeaders => ({
  eventType: headers.get('x-github-event') as string,
  installationId: headers.get('x-github-hook-installation-target-id') as string,
  delivery: headers.get('x-github-delivery') as string,
  hookId: headers.get('x-github-hook-id') as string,
  signature: headers.get('x-hub-signature') as string,
  // Remove "sha256=" from the value "sha256=signature"
  signature256: (headers.get('x-hub-signature-256') as string).slice(7),
});
