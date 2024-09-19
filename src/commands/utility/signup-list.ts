import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import signups from '../../models/signups';
import lowPrioUsers from '../../models/lowPrioUsers';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('signuplist')
        .setDescription('Displays the list of signed up teams for the current channel'),

    async execute(interaction: CommandInteraction) {
        const channelId = interaction.channelId;

        if (!signups.has(channelId)) {
            await interaction.reply('No teams have signed up in this channel yet.');
            return;
        }

        const channelSignups = signups.get(channelId) || { mainList: [], waitList: [] };
        if (!channelSignups) {
            await interaction.reply('No teams have signed up in this channel yet.');
            return;
        }

        const { mainList, waitList } = channelSignups;

        const formatTeams = (teams: { teamName: string, players: any[] }[], startIndex: number) => {
            return teams.map((signup, index) => {
                const players = signup.players.map(player => `<@${player.id}>`).join(', ');
                const isLowPrio = signup.players.some(player => lowPrioUsers.has(player.id));
                return `${startIndex + index + 1}. ${signup.teamName}: ${players}${isLowPrio ? ' * <-- LOW PRIO' : ''}\n`;
            }).join('');
        };

        const sendMessages = async (messages: string[]) => {
            for (const message of messages) {
                await interaction.followUp(message);
            }
        };

        let messages: string[] = [];
        let currentMessage = 'Signed up teams for one lobby:\n';

        const addTeamsToMessages = (teams: { teamName: string, players: any[] }[], startIndex: number) => {
            for (let i = 0; i < teams.length; i += 20) {
                const chunk = teams.slice(i, i + 20);
                currentMessage += formatTeams(chunk, startIndex + i);
                messages.push(currentMessage);
                currentMessage = 'Waitlist or multiple lobbies:\n';
            }
        };

        addTeamsToMessages(mainList, 0);
        addTeamsToMessages(waitList, mainList.length);

        await interaction.reply(messages.shift()!);
        await sendMessages(messages);
    }
};