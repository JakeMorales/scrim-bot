import {DB} from "./db";
import configJson from '../../config.json';
import {ErrorPayload, NhostClient} from "@nhost/nhost-js";
import {GraphQLError} from "graphql/error";
const config: { nhost: {adminSecret: string, subdomain: string, region: string }} = configJson;

class NhostDb extends DB {
  private nhostClient: NhostClient;

  constructor(adminSecret: string, region: string, subdomain: string) {
    super();
    this.nhostClient = new NhostClient({
      autoLogin: false,
      subdomain,
      region,
      adminSecret,
    })
  }

  delete(tableName: string, id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  async get(tableName: string, fields: string[]): Promise<{}> {
    const query = `
      query {
        ${tableName} {
          ${fields.join('\n')}
        }
      }
    `
    const result: { data: { scrims: any[] } | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      throw Error("Graph ql error: " + result.error)
    }
    return result.data;
  }

  post(tableName: string, fields: string[]): Promise<boolean> {
    return Promise.resolve(false);
  }

  update(tableName: string, fields: string[]): Promise<boolean> {
    return Promise.resolve(false);
  }

  customQuery(query: string): Promise<{}> {
    return Promise.resolve({});
  }
}
export const nhostDb = new NhostDb(config.nhost.adminSecret, config.nhost.region, config.nhost.subdomain)
