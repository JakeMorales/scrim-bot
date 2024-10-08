import {DB, JSONValue} from "./db";
import configJson from '../../config.json';
import {ErrorPayload, NhostClient} from "@nhost/nhost-js";
import {GraphQLError} from "graphql/error";
import {Player, PlayerInsert} from "../models/Player";
const config: { nhost: {adminSecret: string, subdomain: string, region: string }} = configJson;

class NhostDb extends DB {
  private nhostClient: NhostClient;
  // TODO cache values?

  constructor(adminSecret: string, region: string, subdomain: string) {
    super();
    this.nhostClient = new NhostClient({
      autoLogin: false,
      subdomain,
      region,
      adminSecret,
    })
  }

  // TODO generate more complicated search queryies, not just _and { _eq }
  private static generateSearchStringFromFields(fields: Record<string, string | number | boolean | null> | undefined): string {
    if (!fields) {
      return ''
    }
    const searchStringArray = Object.keys(fields).map((fieldKey) => `{ ${fieldKey}: { _eq: ${NhostDb.createValueString(fields[fieldKey])} } }`);
    return `(where: { _and: [${searchStringArray.join(", ")}]})`
  }

  async get(tableName: string, fieldsToSearch: Record<string, string | number | boolean | null> | undefined, fieldsToReturn: string[]): Promise<JSONValue> {
    const searchString = NhostDb.generateSearchStringFromFields(fieldsToSearch);
    const query = `
      query {
        ${tableName}${searchString} {
          ${fieldsToReturn.join('\n          ')}
        }
      }
    `
    const result: { data: JSONValue | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      throw Error("Graph ql error: " + result.error)
    }
    return result.data;
  }

  async post(tableName: string, data: Record<string, string | number | boolean | null>): Promise<string> {
    const insertName = "insert_" + tableName;
    const objects = Object.keys(data).map((key) => `${key}: ${NhostDb.createValueString(data[key])}`).join(", ")
    const objectsString = `(objects: [{ ${objects} }])`
    const query = `
      mutation {
        ${insertName}${objectsString} {
          returning {
            id
          }
        }
      }
    `
    const result: { data: JSONValue | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      console.log(query)
      console.log(result.data)
      console.log(result.error)
      throw Error("Graph ql error: " + result.error)
    }
    const returnedData: Record<string, { returning: { id: string}[] }> = result.data as Record<string, { returning: { id: string}[] }>
    return returnedData[insertName].returning[0].id;
  }

  async delete(tableName: string, id: string): Promise<string> {
    const deleteName = "delete_" + tableName;
    const searchString = NhostDb.generateSearchStringFromFields({ id });
    const query = `
      mutation {
        ${deleteName}${searchString} {
          returning {
            id
          }
        }
      }
    `
    const result: { data: JSONValue | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      throw Error("Graph ql error: " + result.error)
    }
    const returnedData: Record<string, { returning: { id: string}[] }> = result.data as Record<string, { returning: { id: string}[] }>
    return returnedData[deleteName].returning[0].id;
  }

  update(tableName: string, fields: string[]): Promise<boolean> {
    return Promise.resolve(false);
  }

  async customQuery(query: string): Promise<JSONValue> {
    const result: { data: JSONValue | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      throw Error("Graph ql error: " + result.error)
    }
    return Promise.resolve(result.data);
  }

  private static createValueString(value: string | number | boolean | null): string {
    if (typeof value === "string") {
      return `"${value}"`
    }
    else if (value === null) {
      return `null`
    }
    return `${value}`
  }
}
export const nhostDb = new NhostDb(config.nhost.adminSecret, config.nhost.region, config.nhost.subdomain)
