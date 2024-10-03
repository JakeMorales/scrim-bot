export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export interface JSONObject {
  [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> { }

export abstract class DB {
  abstract get(tableName: string, fieldsToSearch: Record<string, string>, fieldsToReturn: string[]): Promise<JSONValue>;
  abstract update(tableName: string, fields: string[]): Promise<boolean>;
  // returns id of new object as a string
  abstract post(tableName: string, data: Record<string, string>): Promise<string>;
  // returns id of the deleted object as a string
  abstract delete(tableName: string, id: string): Promise<string>;
  abstract customQuery(query: string): Promise<JSONValue>;
}
