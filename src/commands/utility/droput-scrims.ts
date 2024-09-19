import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import signups from '../../models/signups';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dropout')
        .setDescription('Drops a team from the signup list')
        .addStringOption(option =>
            option
                .setName('teamname')
                .setDescription('Team name')
                .setMinLength(1)
                .setMaxLength(150)
                .setRequired(true)
        ),

    async execute(interaction: any) {
        const channelId = interaction.channelId;
        const teamName = interaction.options.getString('teamname');
        const userId = interaction.user.id;

        if (!signups.has(channelId)) {
            return interaction.reply(`No signups found for this channel.`);
        }

        const channelSignups = signups.get(channelId);
        if (!channelSignups) {
            return interaction.reply(`No signups found for this channel.`);
        }

        const { mainList, waitList } = channelSignups;
        const waitlistCutoff = 20;

        // Function to check if the user is a player in the team
        const isUserInTeam = (team: { teamName: string, players: any[] }) => {
            return team.players.some(player => player.id === userId);
        };

        // Find and remove the team from the main list
        const mainListIndex = mainList.findIndex(team => team.teamName === teamName && isUserInTeam(team));
        if (mainListIndex !== -1) {
            mainList.splice(mainListIndex, 1);
        } else {
            // If not found in the main list, find and remove the team from the waitlist
            const waitlistIndex = waitList.findIndex(team => team.teamName === teamName && isUserInTeam(team));
            if (waitlistIndex !== -1) {
                waitList.splice(waitlistIndex, 1);
            } else {
                return interaction.reply({content: `Team ${teamName} not found in the signups or you are not a member of this team.`, ephemeral: true});
            }
        }

        // Move the top team from the waitlist to the main list if the main list is below the cutoff
        if (mainList.length < waitlistCutoff && waitList.length > 0) {
            const teamToMove = waitList.shift();
            if (teamToMove) {
                mainList.push(teamToMove);
            }
        }

        // Update the signups with the modified lists
        signups.set(channelId, { mainList, waitList });

        await interaction.reply(`Team ${teamName} has been dropped from the signups.`);
    }
};