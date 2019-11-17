const Discord = require('discord.js');
const config = require('./config.json');
const pinyin = require('pinyin');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('!zh args');
});

const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id) || await user.createDM();

    if (channel.messages.has(data.message_id)) return;

    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
        const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
        reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }

    client.emit(events[event.t], reaction, user);
});

client.on('message', message => {
    let channel = message.channel;

    if ((!message.content.startsWith(config.prefix) || message.author.bot) && channel.topic) {
        channel.setName(`${channel.topic}??${multByteStringSlice(message.author.username, 6)}`);
        return
    }

    const args = message.content.slice(config.prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'pinyin' || command === 'zh') {
        if (!args.length) {
            channel.send(`You didn't provide any arguments, ${message.author}!`);
        } else {
            channel.send(pinyin(args.join()).join(' '));
        }
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.author.id !== user.id) {
        let message = `${user.username} reacted with ${reaction.emoji.name} to\n${reaction.message.cleanContent}`;
        reaction.message.author.send(message);
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    // console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
});

client.login(config.token);

function strLength(strSrc) {
    len = 0;
    strSrc = escape(strSrc);
    for (i = 0; i < strSrc.length; i++ , len++) {
        if (strSrc.charAt(i) == '%') {
            if (strSrc.charAt(++i) == 'u') {
                i += 3;
                len++;
            }
            i++;
        }
    }
    return len;
}

function multByteStringSlice(str, strLimit) {
    var isSlice = false;
    while (strLength(str) > strLimit) {
        str = str.slice(0, str.length - 1);
        isSlice = true;
    }
    if (isSlice) {
        str += '...';
    }
    return str;
}