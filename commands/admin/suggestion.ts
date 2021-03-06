import { Command } from 'discord-akairo';
import { MessageEmbed, Message, TextChannel, GuildChannel } from 'discord.js';
import { getBotTestingChannel, capitalize, Delay } from '../../utils/functions';
import { MESSAGES } from '../../utils/constants';
import { HMessage } from '../../utils/classes/HMessage';

const impArgs = [ 'improvement', 'imp', '+' ];
const featArgs = [ 'fix', 'feat', 'feature', '!' ];
const allTypes = [ 'core', 'job', 'immersion', 'other', 'fix' ];

const sugTypes: {
    type: string,
    sub: string[],
    channel: string
}[] = [
    /* *********************** */
    /*      Improvements       */
    /* *********************** */
    {
        type: 'core',
        sub: impArgs,
        channel: '696366360418189422'
    },
    {
        type: 'job',
        sub: impArgs,
        channel: '696366413442449409'
    },
    {
        type: 'immersion',
        sub: impArgs,
        channel: '696366791345045535'
    },
    {
        type: 'other',
        sub: impArgs,
        channel: '696366913118535742'
    },

    /* *********************** */
    /*        Features         */
    /* *********************** */
    {
        type: 'core',
        sub: featArgs,
        channel: '696367993776504857'
    },
    {
        type: 'job',
        sub: featArgs,
        channel: '696368023665377310'
    },
    {
        type: 'other',
        sub: featArgs,
        channel: '696366526521147464'
    },

    /* *********************** */
    /*          Fixes          */
    /* *********************** */
    {
        type: 'fix',
        sub: [ '!', 'fix' ],
        channel: '696366450495193169'
    }
];

const subArgs = impArgs.concat(featArgs).concat([ 'fix', '!' ]);

export default class Suggestion extends Command {
    constructor() {
        super('suggestion', {
            aliases: [ 'suggestion' ],
            description: {
                content: MESSAGES.COMMANDS.SUGGESTION.DESCRIPTION,
                usage: '<msg> <type> <sub>',
                examples: [ '803851819243667468 job fix', '803851819243667468 core feat' ]
            },
            category: 'staff',
            channel: 'guild',
            args: [
                {
                    id: 'msg',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.SUGGESTION.PROMPT.START(message.author)
                    },
                    type: 'message'
                },
                {
                    id: 'type',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.SUGGESTION.PROMPT.START_2(message.author)
                    },
                    type: allTypes
                },
                {
                    id: 'sub',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.SUGGESTION.PROMPT.START_3(message.author)
                    },
                    type: subArgs
                }
            ],
            userPermissions: (message: Message) => {
                const member = message.member;
                return member ? member.roles.cache.find(role => role.name.toLowerCase().startsWith('geek ')) : null;
            }
        });
    }

    public async exec(message: HMessage, { msg, type, sub }: { msg: Message, type: string, sub: string }) {
        message.delete();

        const thisChannel = message.channel;

        if (message.channel.id !== '552648193737883648') {
            return message.reply('this command cannot be used in this channel.');
        }

        if (!message.member.roles.cache.has('625068930485977138') && !(<GuildChannel> thisChannel).permissionsFor(message.member).has('MANAGE_MESSAGES')) {
            return;
        }

        const errorChannel: TextChannel = getBotTestingChannel() instanceof TextChannel ? <TextChannel> getBotTestingChannel() : null;
        let foundType;
        for (const [ , val ] of Object.entries(sugTypes)) {
            if (val.type === type && val.sub.includes(sub)) {
                foundType = val;
                break;
            }
        }

        if (!foundType) {
            const m = await message.reply('I could not evaluate which type of suggestion this is.');
            await Delay(3000);
            return (<HMessage> m).delete();
        }

        const sugChannel = message.guild.channels.cache.get(foundType.channel);

        if (!sugChannel || !(sugChannel instanceof TextChannel)) {
            return errorChannel ? errorChannel.send(`Something went wront when trying to find the suggestion channel for user ${message.author.username}`) : null;
        }

        const embed = new MessageEmbed()
            .setAuthor(`Suggestion | ${capitalize(type)} ${capitalize(sub) !== capitalize(type) ? capitalize(sub) : ''}`)
            .setDescription(`**Message Content**\n\n${msg.content}`)
            .addField('Suggestion Author', msg.author.tag)
            .addField('Command executed by', message.author.tag)
            .setTimestamp()
            .setColor('#FFC600');

        let upVotes = 0;
        let downVotes = 0;
        if (msg.reactions.cache.size) {
            msg.reactions.cache.forEach(r => {
                if (r.emoji.id === '519912214761570305') {
                    upVotes += r.count;
                } else if (r.emoji.id === '619413043792707606') {
                    downVotes += r.count;
                }
            });

            upVotes -= 1;
            downVotes -= 1;

            embed.addField('Upvotes', upVotes, true);
            embed.addField('Downvotes', downVotes, true);
        }

        return sugChannel.send(embed);
    }
}
