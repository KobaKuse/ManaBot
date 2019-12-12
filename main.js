const Discord = require('discord.js');
const config = require('./config.json');
const pinyin = require('pinyin');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('!zh args');
});

client.on('message', message => {
    let channel = message.channel;

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
