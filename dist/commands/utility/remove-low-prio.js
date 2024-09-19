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
        .setName('removelowprio')
        .setDescription('Removes a user from the low priority list')
        .addUserOption(option => option.setName('user')
        .setDescription('User to remove from low priority list')
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = interaction.options.getUser('user');
            lowPrioUsers_1.default.delete(user.id);
            yield interaction.reply(`User ${user.username} has been removed from the low priority list.`);
        });
    }
};
