import { SlashCommandBuilder } from 'discord.js';
import lowPrioUsers from '../../models/lowPrioUsers';
import signups from '../../models/signups';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('signup')
        .setDescription('Creates a new scrim signup')
        .addStringOption(option =>
            option
                .setName('teamname')
                .setDescription('Team name')
                .setMinLength(1)
                .setMaxLength(150)
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('player1')
                .setDescription('@player1')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('player2')
                .setDescription('@player2')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('player3')
                .setDescription('@player3')
                .setRequired(true)),

    async execute(interaction: any) {
        const channelId = interaction.channelId;
        const teamName = interaction.options.getString('teamname');
        const player1 = interaction.options.getUser('player1');
        const player2 = interaction.options.getUser('player2');
        const player3 = interaction.options.getUser('player3');

        if (!signups.has(channelId)) {
            signups.set(channelId, { mainList: [], waitList: [] });
        }

        const channelSignups = signups.get(channelId) || { mainList: [], waitList: [] };
        if (channelSignups) {
            const waitlistCutoff = 20;
            const { mainList, waitList } = channelSignups;

            const newTeam = { teamName, players: [player1, player2, player3] };

            if (mainList.length < waitlistCutoff) {
                mainList.push(newTeam);
            } else if(mainList.length >= waitlistCutoff) {
                waitList.push(newTeam);
            }

            // Ensure the main list does not exceed the cutoff
            while (mainList.length > waitlistCutoff) {
                const lowPrioTeamIndex = mainList.findIndex(team => team.players.some(player => lowPrioUsers.has(player.id)));
                if (lowPrioTeamIndex !== -1) {
                    const lowPrioTeam = mainList.splice(lowPrioTeamIndex, 1)[0];
                    waitList.push(lowPrioTeam);
                } else {
                    waitList.unshift(mainList.pop()!);
                }
            }

            if (waitList.length > 0) {
                const nonLowPrioWaitlist = waitList.filter(team => !team.players.some(player => lowPrioUsers.has(player.id)));
                const lowPrioWaitlist = waitList.filter(team => team.players.some(player => lowPrioUsers.has(player.id)));
                
                // Update the signups with the adjusted lists
                if(nonLowPrioWaitlist && lowPrioWaitlist){
                    // Combine the non-low priority and low priority waitlists
                    const finalWaitlist = nonLowPrioWaitlist.concat(lowPrioWaitlist);
                    signups.set(channelId, { mainList, waitList: finalWaitlist });
                }
                else if(nonLowPrioWaitlist && !lowPrioWaitlist){
                    signups.set(channelId, { mainList, waitList });
                }
                
                // Update the signups with the adjusted lists
            } else {
                signups.set(channelId, { mainList, waitList });
            }

            await interaction.reply(`Team ${teamName} signed up with players: ${player1}, ${player2}, ${player3}`);
        }

    }
};