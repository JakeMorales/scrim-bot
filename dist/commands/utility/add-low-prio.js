"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lowPrioUsers_1 = __importDefault(require("../../models/lowPrioUsers"));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('addlowprio')
        .setDescription('Adds up to 3 users to the low priority list')
        .addUserOption(option => option.setName('user1')
        .setDescription('First user to add to low priority list')
        .setRequired(true))
        .addUserOption(option => option.setName('user2')
        .setDescription('Second user to add to low priority list')
        .setRequired(false))
        .addUserOption(option => option.setName('user3')
        .setDescription('Third user to add to low priority list')
        .setRequired(false)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const user1 = interaction.options.getUser('user1');
            const user2 = interaction.options.getUser('user2');
            const user3 = interaction.options.getUser('user3');
            const users = [user1, user2, user3].filter(user => user !== null);
            users.forEach(user => {
                lowPrioUsers_1.default.add(user.id);
            });
            const userNames = users.map(user => user.username).join(', ');
            yield interaction.reply(`User(s) ${userNames} have been added to the low priority list.`);
        });
    }
};
