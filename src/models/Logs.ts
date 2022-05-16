import { ChiselEntity } from "@chiselstrike/api"

export class Logs extends ChiselEntity {
  content: string;
  level: string;
  createdAt: string;
}
