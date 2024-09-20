import { Events, Message } from 'discord.js';
import { scrimSignupChannels, whitelistedCommands } from '../models/scrimChannelData';


module.exports = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        if (scrimSignupChannels.has(message.channel.id)) {
            console.log('Scrim signup channel message detected');
            if (!whitelistedCommands.has(message.content)) {
                const botReply = await message.reply('Please use the bot commands for scrim signups.');

                setTimeout(async () => {
                    await message.delete();
                    await botReply.delete();
                    await message.author.send('Hello world');
                }, 15000); // 15 seconds in milliseconds
            }
        }
    },
};