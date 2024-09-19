import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { Command } from './ExtendedClient'; // Adjust the import path as needed

interface Config {
  clientId: string;
  guildId: string;
  token: string;
}

import configJson from '../config.json';
const config: Config = configJson as Config;

const commands: any[] = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);



console.log(`Found command folders: ${commandFolders}`);

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  console.log(`Found command files in ${folder}: ${commandFiles}`);

  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: Command = require(filePath) as Command;

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`Added command: ${command.data.name}`);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

console.log(`Total commands to deploy: ${commands.length}`);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    var data: any;
    
    data = await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
