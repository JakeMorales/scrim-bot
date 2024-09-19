import { SlashCommandBuilder, CommandInteraction, GuildMember } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information about the user.');

export async function execute(interaction: CommandInteraction): Promise<void> {
    const member = interaction.member;

  if (member instanceof GuildMember) {
    const joinedAt = member.joinedAt;
    if (joinedAt) {
      await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${joinedAt}.`);
    } else {
      await interaction.reply(`This command was run by ${interaction.user.username}, but I couldn't determine when they joined.`);
    }
  } else {
    await interaction.reply(`This command was run by ${interaction.user.username}, but I couldn't determine when they joined.`);
  }
}