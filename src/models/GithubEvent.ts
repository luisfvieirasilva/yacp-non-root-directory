import { ChiselEntity } from '@chiselstrike/api';

export class GithubEvent extends ChiselEntity {
  type: string;
  contents: string;
  hookId: string;
  deliveryId: string;
  // Has the timestamp of when this event has processed, else undefined if still needs to be treated
  processedAt?: string = '';
  // @deprecated: use the projectId for more info on a project
  githubRepository?: string;
  account = '';
}
