import {ErrorPayload, NhostClient} from '@nhost/nhost-js'
import {GraphQLError} from "graphql/error";

const subdomain = 'bsgzgiiagytbnyqsvebl';

// Function to fetch data from the scrims table
export async function fetchScrims() {

  const nhost = new NhostClient({
    autoLogin: false,
    subdomain,
    region: 'us-east-1',
  })

  const result: { data: { scrims: any[] } | null; error: GraphQLError[] | ErrorPayload | null } = await nhost.graphql.request(`
    query {
      scrims {
        id
        date_field
        overstat_link
        skill
      }
    }
  `)
  console.log("Data", result.data?.scrims)

  return result.data?.scrims;
}
