import {ChatInputCommandInteraction, Snowflake} from "discord.js";

const signupCommand = require('../src/commands/utility/sign-up-basic')

import signups from '../src/models/signups';
import lowPrioUsers from '../src/models/lowPrioUsers';

describe('Signup basic', () => {
  const channelId = 'some id' as unknown as Snowflake// this is supposed to be a Snowflake but I don't want to mock it strings work just fine
  let interaction: ChatInputCommandInteraction;
  let lowPrioInteraction: ChatInputCommandInteraction;

  beforeAll(() => {
    interaction = {
      options: {
        getUser: () => ({ name: "Supreme", id: '1'}),
        getString: () => "Team name"
      },
      reply: (message: string) => {
        console.log("Replying to command with:", message)
      },
      channelId
    } as unknown as ChatInputCommandInteraction
    lowPrioInteraction = {
      options: {
        getUser: () => ({ name: "TheHeuman", id: '2'}),
        getString: () => "Low Prio team"
      },
      reply: (message: string) => {
        console.log("Replying to command with:", message)
      },
      channelId
    } as unknown as ChatInputCommandInteraction
  })

  beforeEach(() => {
    signups.clear()
    lowPrioUsers.clear()
  })

  it('Should add team to signups', async ()=> {
    let scrimSignups = signups.get(channelId)
    expect(scrimSignups).toEqual(undefined)
    await signupCommand.execute(interaction)
    scrimSignups = signups.get(channelId)
    expect(scrimSignups?.mainList.length).toEqual(1)
    expect(scrimSignups?.waitList.length).toEqual(0)
  })

  it('Should add team to waitlist when signups are full', async ()=> {
    for (let i = 0; i<20; i++) {
      // TODO make team name and users unique here
      await signupCommand.execute(interaction)
    }
    let scrimSignups = signups.get(channelId)
    expect(scrimSignups?.mainList.length).toEqual(20)
    expect(scrimSignups?.waitList.length).toEqual(0)
    await signupCommand.execute(interaction)
    scrimSignups = signups.get(channelId)
    expect(scrimSignups?.mainList.length).toEqual(20)
    expect(scrimSignups?.waitList.length).toEqual(1)
  })

  it('Should add team to signups when signups are full but there is a low prio team', async ()=> {
    lowPrioUsers.add('2')
    await signupCommand.execute(lowPrioInteraction)
    for (let i = 0; i<19; i++) {
      // TODO make team name and users unique here
      await signupCommand.execute(interaction)
    }
    let scrimSignups = signups.get(channelId)
    expect(scrimSignups?.mainList.length).toEqual(20)
    expect(scrimSignups?.waitList.length).toEqual(0)
    await signupCommand.execute(interaction)
    scrimSignups = signups.get(channelId)
    expect(scrimSignups?.mainList.length).toEqual(20)
    expect(scrimSignups?.waitList[0].teamName).toEqual("Low Prio team")
  })

  it('Should always have wait list teams at the very bottom', async ()=> {
    lowPrioUsers.add('2')
    await signupCommand.execute(lowPrioInteraction)
    for (let i = 0; i<30; i++) {
      // TODO make team name and users unique here
      await signupCommand.execute(interaction)
    }
    await signupCommand.execute(lowPrioInteraction)
    const scrimSignups = signups.get(channelId)
    expect(scrimSignups?.mainList.length).toEqual(20)
    const waitListLength = scrimSignups?.waitList.length ?? -1
    expect(waitListLength).toEqual(12)
    expect(scrimSignups?.waitList[waitListLength - 1].teamName).toEqual("Low Prio team")
    expect(scrimSignups?.waitList[waitListLength - 2].teamName).toEqual("Low Prio team")
    for (const team of scrimSignups?.mainList ?? []) {
      expect(team.teamName).toEqual("Team name")
    }
  })
})
