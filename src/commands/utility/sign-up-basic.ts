import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
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

    async execute(interaction: ChatInputCommandInteraction) {
        const channelId = interaction.channelId;
        const teamName = interaction.options.getString('teamname');
        const player1 = interaction.options.getUser('player1');
        const player2 = interaction.options.getUser('player2');
        const player3 = interaction.options.getUser('player3');

        if (!teamName) {
          await interaction.reply(`Signup NOT registered, no team name provided`);
          return
        }
        else if (!player1 || !player2 || !player3) {
          await interaction.reply(`Signup NOT registered, a team needs three players`);
          return
        }


        if (!signups.has(channelId)) {
            signups.set(channelId, { mainList: [], waitList: [] });
        }

        const channelSignups = signups.get(channelId) || { mainList: [], waitList: [] };
        if (channelSignups) {
            const waitlistCutoff = 20;
            const { mainList, waitList } = channelSignups;

            const newTeam = { teamName, players: [player1, player2, player3] };

            const allTeams = [...mainList, ...waitList]
            allTeams.push(newTeam)
            allTeams.sort((teamA, teamB) => {
              const lowPrioAmountA = teamA.players.reduce((count, player) => lowPrioUsers.has(player.id) ? count + 1 : count, 0)
              const lowPrioAmountB = teamB.players.reduce((count, player) => lowPrioUsers.has(player.id) ? count + 1 : count, 0)
              return lowPrioAmountA - lowPrioAmountB
            })
            signups.set(channelId, { mainList: allTeams.splice(0, waitlistCutoff), waitList: allTeams });
            await interaction.reply(`Team ${teamName} signed up with players: ${player1}, ${player2}, ${player3}`);
        }

    }
};
