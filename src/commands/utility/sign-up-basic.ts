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

        const scrimId = signups.scrimChannelMap.get(channelId as String);
        if (scrimId) {
          try {
            const signupId = await signups.addTeam(scrimId, teamName, [player1, player2, player3])
            interaction.reply(`Team ${teamName} signed up with players: ${player1}, ${player2}, ${player3}, Signup id: ${signupId}`);
          }
          catch (error) {
            interaction.reply(`Team not created: ${error.message}`)
          }
        }
        else if (scrimId) {
          interaction.reply("Associated scrim not found, team not created, this is probably a configuration error, contact admins")
        }

    }
};
