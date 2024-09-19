import { Events } from 'discord.js';

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: any) {

        if (interaction.customId === 'scrimmodal') {
            const teamName = interaction.fields.getTextInputValue('teamname');
            const captain = interaction.fields.getTextInputValue('captain');
            const player2 = interaction.fields.getTextInputValue('player2');
            const player3 = interaction.fields.getTextInputValue('player3');

            const captainId = await findUserIdByUsername(captain, interaction);
            const player2Id = await findUserIdByUsername(player2, interaction);
            const player3Id = await findUserIdByUsername(player3, interaction);

            await interaction.reply(`${teamName} <@${captainId}> <@${player2Id}> <@${player3Id}>`);
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    },

};

async function findUserIdByUsername(username: any, interaction: any) {
    try {
        const guild = interaction.client.guilds.cache.first(); // Get the first guild the bot is in
        if (!guild) return null;

        const member = await guild.members.fetch({ query: username, limit: 1 });
        if (member.size === 0) return null;

        return member.first().user.id;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}