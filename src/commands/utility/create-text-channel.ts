// Importing SlashCommandBuilder is required for every slash command
// We import PermissionFlagsBits so we can restrict this command usage
// We also import ChannelType to define what kind of channel we are creating
import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import signups from "../../models/signups";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createscrimsignup') // Command name matching file name
        .setDescription('Creates a new scrim signup text channel')
        // Text channel name
        .addStringOption((option: any) =>
            option
                .setName('scrimdate') // option names need to always be lowercase and have no spaces
                .setDescription('Choose date of the scrim')
                .setMinLength(3) // A text channel needs to be named
                .setMaxLength(5) // Discord will cut-off names past the 25 characters,
                // so that's a good hard limit to set. You can manually increase this if you wish
                .setRequired(true),
        )
        .addStringOption((option: any) =>
            option
                .setName('scrimtime') // option names need to always be lowercase and have no spaces
                .setDescription('Choose the time of the scrim')
                .setMinLength(3) // A text channel needs to be named
                .setMaxLength(4) // Discord will cut-off names past the 25 characters,
                // so that's a good hard limit to set. You can manually increase this if you wish
                .setRequired(true),
        )
        .addStringOption((option: any) =>
            option
                .setName('scrimtype') // option names need to always be lowercase and have no spaces
                .setDescription('Choose the type of scrim')
                .setMinLength(1) // A text channel needs to be named
                .setMaxLength(25) // Discord will cut-off names past the 25 characters,
                // so that's a good hard limit to set. You can manually increase this if you wish
                .setRequired(true),
        )
        // You will usually only want users that can create new channels to
        // be able to use this command and this is what this line does.
        // Feel free to remove it if you want to allow any users to
        // create new channels
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        // It's impossible to create normal text channels inside DMs, so
        // it's in your best interest in disabling this command through DMs
        // as well. Threads, however, can be created in DMs, but we will see
        // more about them later in this post
        .setDMPermission(false),
    async execute(interaction: any) {
      /*
       TODO change variable names for date, time, type
       can we change so discord only accepts date times?

       reply that channel was created
       try to add scrim to db, if unsucessfull, delete channel, reply with error
       */
        // Before executing any other code, we need to acknowledge the interaction.
        // Discord only gives us 3 seconds to acknowledge an interaction before
        // the interaction gets voided and can't be used anymore.
        await interaction.reply({
            content: 'Fetched all input and working on your request!',
        });

        // After acknowledging the interaction, we retrieve the string sent by the user
        const channelDate = interaction.options.getString('scrimdate');
        const channelTime = interaction.options.getString('scrimtime');
        const channelType = interaction.options.getString('scrimtype');
        const controllerSpacer = `🎮┋`;
        const chosenChannelName = `${controllerSpacer}${channelDate}-${channelTime}-eastern-${channelType}-scrims`;

        // Do note that the string passed to the method .getString() needs to
        // match EXACTLY the name of the option provided (line 12 in this file).
        // If it's not a perfect match, this will always return null
        let channelId: string;
        try {
            // Check if this channel where the command was used is stray
            if (!interaction.channel.parent) {
                // If the channel where the command was used is stray,
                // create another stray channel in the server.
                const createdChannel = await interaction.guild.channels.create({
                    name: chosenChannelName, // The name given to the channel by the user
                    type: ChannelType.GuildText, // The type of the channel created.
                    // Since "text" is the default channel created, this could be ommitted
                });
                // Notice how we are creating a channel in the list of channels
                // of the server. This will cause the channel to spawn at the top
                // of the channels list, without belonging to any categories (more on that later)
                channelId = createdChannel.id;
                // If we managed to create the channel, edit the initial response with
                // a success message
                await interaction.editReply({
                    content: 'Your channel was successfully created!',
                });

                return;
            }
            // Check if this channel where the command was used belongs to a category
            else if (interaction.channel.parent) {
                // If the channel where the command belongs to a category,
                // create another channel in the same category.
                const createdChannel = await interaction.channel.parent.children.create({
                    name: chosenChannelName, // The name given to the channel by the user
                    type: ChannelType.GuildText, // The type of the channel created.
                    // Since "text" is the default channel created, this could be ommitted
                });
                channelId = createdChannel.id;

                // If we managed to create the channel, edit the initial response with
                // a success message
                await interaction.editReply({
                    content: `Channel created <#${channelId}>`,
                });
            }


          if (channelId) {
            const dateTime = `${channelDate} - ${channelTime}`
            console.log(dateTime)
            const scrimDate = new Date(dateTime)
            signups.createScrim(channelId, scrimDate);
            const channel = await interaction.client.channels.cache.get(channelId);
            if (channel && channel.isTextBased()) {
              await channel.send(`Scrims will begin at ${channelTime} Eastern on the posted date. If there are fewer than 20 sign ups by 3:00pm on that day then scrims will be cancelled.\n\nWhen signing up please sign up with the format " Team Name - @ Player 1 @ Player 2 @ Player 3" If you use @TBD or a duplicate name you will lose your spot in the scrim. POI Draft will take place one hour before match start in DRAFT 1.\n\nIf we have enough teams for multiple lobbies, seeding will be announced before draft and additional drafts will happen in DRAFT 2, etc.\n\nLook in <#1267487335956746310> and this channel for codes and all necessary information, to be released the day of scrims`);
            } else {
              console.error('Channel is not text-based or does not exist.');
            }
          } else {
            console.error("MISSING CHANNEL ID");
          }
          return
        } catch (error) {
            // If an error occurred and we were not able to create the channel
            // the bot is most likely received the "Missing Permissions" error.
            // Log the error to the console
            console.log(error);
            // Also inform the user that an error occurred and give them feedback
            // about how to avoid this error if they want to try again
            await interaction.editReply({
                content:
                    'Your channel could not be created! Please check if the bot has the necessary permissions!',
            });
        }


    },
};
