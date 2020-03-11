import * as colors from 'colors';
import { CommandoClient } from 'discord.js-commando';
import { join } from 'path';
import 'typescript';
import './lib/env';
import './utils/functions';
import './utils/serverStatusTracking';
import { GuildMember, Role } from 'discord.js';
import * as Sentry from '@sentry/node';

colors.setTheme({
    debug: 'cyan',
    error: 'red',
    success: 'green',
    warn: 'yellow'
});

Sentry.init({
    dsn: 'https://9e5cb5c000e2487e92b2c5f6269c76b2@sentry.io/3983160'
});

export const client: CommandoClient = new CommandoClient({
    commandPrefix: process.env.PREFIX ?? 'p.',
    invite: 'https://discord.gg/5e2bRgz',
    owner: '264662751404621825',
    nonCommandEditable: false,
    commandEditableDuration: 0
});

client
    .on('error', console.error)
    .on('warn', console.warn)
    .once('ready', () => {
        console.log(`Logged in as ${client.user?.tag}! (${client.user?.id})`.green);
        console.log(`Prefix is set to: ${client.commandPrefix}`.cyan);
        if (process.env.BUILD !== undefined) {
            console.log(`Current build: [ ${process.env.BUILD} ]`.yellow);
        }
    })
    .on('guildMemberAdd', async (member: GuildMember) => {
        if (member.guild.id === '685320619943788582') {
            const role: Role = member.guild.roles.cache.find(r => r.name === 'normies');
            if (role) {
                await member.roles.add(role);
            }
        }
    })
    .registry
        .registerDefaultTypes()
        .registerGroups([
            ['misc', 'Miscellaneous commands that don\'t fit in other groups.'],
            ['information', 'Commands that provide useful information to the user.'],
            ['admin', 'Commands to help administration give out information and perform their tasks more easily.']
            // ['fivem', 'Commands that are related to FiveM.']
        ])
        .registerDefaultGroups()
        .registerDefaultCommands({
            help: false,
            unknownCommand: false
        })
        .registerCommandsIn(join(__dirname, 'commands'));

client.login(process.env.BOT_TOKEN);

/*
declare global {
    namespace NodeJS {
        // tslint:disable-next-line: interface-name
        interface Global {
            __rootdir__: string;
        }
    }
}

global.__rootdir__ = __dirname || process.cwd();
*/