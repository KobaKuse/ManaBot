const Discord = require('discord.js')
const config = require('./config.json')
const pinyin = require('pinyin')
const request = require('request')
const client = new Discord.Client()

const postWords = (args, message, sheetUrl) => {
    let options = {
        uri:
            sheetUrl
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
    message.reply(`added **${args[0]}** to Dictionary`)
}

const reciveCommand = (message, channel, sheetUrl) => {
    const filter = m => m.author.id === message.author.id
    let postData = []
    message.delete(10000)

    channel.send('If it is blank please type **( - )** Please type **Word or Sentence**... will expire in a minute').then(r => r.delete(10000))
    channel.awaitMessages(filter, { max: 1, time: 60000 }).then(j => {
        if (!j.first() || j.first().content === "-") {
            return channel.send('**Word or Sentence** was blank').then(r => r.delete(10000))
        }
        j.first().delete(10000)
        channel.send('Please type **Pronunciation** of words... will expire in a minute').then(r => r.delete(10000))
        channel.awaitMessages(filter, { max: 1, time: 60000 }).then(k => {
            if (k.first()) k.first().delete(10000)
            channel.send('Please type **Meaning** of words... will expire in a minute').then(r => r.delete(10000))
            channel.awaitMessages(filter, { max: 1, time: 60000 }).then(l => {
                if (l.first()) l.first().delete(10000)
                channel.send('Please type **Example** of words... will expire in a minute').then(r => r.delete(10000))
                channel.awaitMessages(filter, { max: 1, time: 60000 }).then(m => {
                    if (m.first()) m.first().delete(10000)
                    postData[0] = j.first().content
                    postData[1] = k.first() ? k.first().content : "-"
                    postData[2] = l.first() ? l.first().content : "-"
                    postData[3] = m.first() ? m.first().content : "-"
                    postWords(postData, message, sheetUrl)
                })
            })
        })
    })
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
            return channel.send(`You didn't provide any arguments.`).then(r => r.delete(10000))
        } else {
            channel.send(pinyin(args.join()).join(' '))
        }
    } else if (command === 'word' || command === 'w') {
        if (args[0] === 'jp' || args[0] === 'j') {
            reciveCommand(message, channel, "https://script.google.com/macros/s/AKfycbz4FSe6iSlsQBfIBORc2DjkFQCy9_9vjbj4hgzc/exec")//JP
        } else if (args[0] === 'zh' || args[0] === 'z') {
            reciveCommand(message, channel, "https://script.google.com/macros/s/AKfycbymvndbSXkDNPtwO6pn4FOW_zQ1eQy6hC2JLj7TaQ9zgMjFZSM/exec")//ZH
        } else if (args[0] === 'en' || args[0] === 'e') {
            reciveCommand(message, channel, "https://script.google.com/macros/s/AKfycbzmPjhN7qss64ct5ppRY6FCr7HPr46N2BX4Pw5Y83TXNYPl4EW6/exec")//EN
        } else {
            reciveCommand(message, channel, "https://script.google.com/macros/s/AKfycbz4FSe6iSlsQBfIBORc2DjkFQCy9_9vjbj4hgzc/exec")//JP
        }
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