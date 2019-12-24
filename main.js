const Discord = require('discord.js')
const config = require('./config.json')
const pinyin = require('pinyin')
const request = require('request')
const client = new Discord.Client()

const postWords = (args, message) => {
    let options = {
        uri:
            "https://script.google.com/macros/s/AKfycbz4FSe6iSlsQBfIBORc2DjkFQCy9_9vjbj4hgzc/exec"
        ,
        headers: {
            "Content-type": "application/json",
        },
        json: {
            "noun": args[0],
            "pron": args[1],
            "meaning": args[2],
            "example": args[3],
            "time": getNowYMD()
        }
    }
    request.post(options, function (error, response, body) { })
    message.reply(`added **${args[0]}** to Dictionary`).then(r => r.delete(600000))
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity('!zh args')
})

client.on('message', message => {
    let channel = message.channel

    const args = message.content.slice(config.prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()

    channel.startTyping()

    if (command === 'pinyin' || command === 'zh') {
        if (!args.length) {
            channel.send(`You didn't provide any arguments.`)
        } else {
            channel.send(pinyin(args.join()).join(' '))
        }

    } else if (command === 'word' || command === 'w') {
        const filter = m => m.author.id === message.author.id

        let postData = []

        channel.send('If it is blank please type **-**').then(r => r.delete(60000))
        message.reply('Please type **Word or Sentence**... will expire in a minute').then(r => r.delete(30000))
        channel.awaitMessages(filter, { max: 1, time: 60000 }).then(j => {
            if (!j.first() || j.first().content === "-") {
                return message.reply('**Word or Sentence** is blank').then(r => r.delete(30000))
            }
            message.reply('Please type **Pronunciation** of words... will expire in a minute').then(r => r.delete(30000))
            channel.awaitMessages(filter, { max: 1, time: 60000 }).then(k => {
                message.reply('Please type **Meaning** of words... will expire in a minute').then(r => r.delete(30000))
                channel.awaitMessages(filter, { max: 1, time: 60000 }).then(l => {
                    message.reply('Please type **Example** of words... will expire in a minute').then(r => r.delete(30000))
                    channel.awaitMessages(filter, { max: 1, time: 60000 }).then(m => {
                        postData[0] = j.first().content
                        postData[1] = k.first() ? k.first().content : "-"
                        postData[2] = l.first() ? l.first().content : "-"
                        postData[3] = m.first() ? m.first().content : "-"
                        postWords(postData, message)
                    })
                })
            })
        })
    }

    channel.stopTyping()
})

client.login(config.token)

function getNowYMD() {
    var dt = new Date();
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth() + 1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var result = y + "/" + m + "/" + d;
    return result;
}