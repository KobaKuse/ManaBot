const Discord = require('discord.js')
const config = require('./config.json')
const pinyin = require('pinyin')
const request = require('request')
const client = new Discord.Client()

const GAS_URL_JP = "https://script.google.com/macros/s/AKfycbz4FSe6iSlsQBfIBORc2DjkFQCy9_9vjbj4hgzc/exec",
    GAS_URL_ZH = "https://script.google.com/macros/s/AKfycbymvndbSXkDNPtwO6pn4FOW_zQ1eQy6hC2JLj7TaQ9zgMjFZSM/exec",
    GAS_URL_EN = "https://script.google.com/macros/s/AKfycbzmPjhN7qss64ct5ppRY6FCr7HPr46N2BX4Pw5Y83TXNYPl4EW6/exec"

const SHEET_URL_JP = "https://docs.google.com/spreadsheets/d/1tbT1qslmvK1uqk9EAuGYyHVuRdibKrW7FCdSeAPupN4/edit?usp=sharing",
    SHEET_URL_ZH = "https://docs.google.com/spreadsheets/d/1Re-W0qqaQPHzPUGgCHf0X51ER1aYBX8_z-rF5d3K67E/edit?usp=sharing",
    SHEET_URL_EN = "https://docs.google.com/spreadsheets/d/1MmBdoduV2FbB2npoc0O13tAXhlkTeaQVQOEuE-o08jI/edit?usp=sharing"

const botMessageSend = (string, channel, deleteTime) => {
    channel.send({
        embed: {
            color: 14003441,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
            },
            fields: [{
                name: "BOT Message",
                value: string,
                inline: true
            },
            ],
        }
    }).then(r => {
        if (!deleteTime == 0) {
            r.delete(deleteTime)
        }
    })
}

const postWords = (postData, channel, gasUrl) => {
    let options = {
        uri:
            gasUrl
        ,
        headers: {
            "Content-type": "application/json",
        },
        json: {
            "noun": postData[0],
            "pron": postData[1],
            "meaning": postData[2],
            "example": postData[3],
            "time": getNowYMD()
        }
    }
    request.post(options, function (error, response, body) { })
    if (gasUrl === GAS_URL_JP) {
        botMessageSend(`added **${postData[0]}** to JP.\n[Click Here](${SHEET_URL_JP})`, channel, 0) //JP
    } else if (gasUrl === GAS_URL_ZH) {
        botMessageSend(`added **${postData[0]}** to ZH.\n[Click Here](${SHEET_URL_ZH})`, channel, 0) //ZH
    } else if (gasUrl === GAS_URL_EN) {
        botMessageSend(`added **${postData[0]}** to EN.\n[Click Here](${SHEET_URL_EN})`, channel, 0) //EN
    } else {
        botMessageSend(`added **${postData[0]}** to JP.\n[Click Here](${SHEET_URL_JP})`, channel, 0) //JP
    }
}

const reciveCommand = (message, channel, gasUrl) => {
    const filter = m => m.author.id === message.author.id
    let postData = []

    botMessageSend(`If it is blank please type **( - )** Please type **Word or Sentence**... will expire in a minute`, channel, 10000)
    channel.awaitMessages(filter, { max: 1, time: 60000 }).then(j => {
        if (!j.first() || j.first().content === "-") {
            return botMessageSend(`**Word or Sentence** was blank`, channel, 10000)
        }
        j.first().delete(10000)
        botMessageSend(`Please type **Pronunciation** of words... will expire in a minute`, channel, 10000)
        channel.awaitMessages(filter, { max: 1, time: 60000 }).then(k => {
            if (k.first()) k.first().delete(10000)
            botMessageSend(`Please type **Meaning** of words... will expire in a minute`, channel, 10000)
            channel.awaitMessages(filter, { max: 1, time: 60000 }).then(l => {
                if (l.first()) l.first().delete(10000)
                botMessageSend(`Please type **Example** of words... will expire in a minute`, channel, 10000)
                channel.awaitMessages(filter, { max: 1, time: 60000 }).then(m => {
                    if (m.first()) m.first().delete(10000)
                    postData[0] = j.first().content
                    postData[1] = k.first() ? k.first().content : "-"
                    postData[2] = l.first() ? l.first().content : "-"
                    postData[3] = m.first() ? m.first().content : "-"
                    postWords(postData, channel, gasUrl)
                })
            })
        })
    })
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity('arknights2.jp', { type: 'WATCHING' })
})

client.on('message', message => {
    let channel = message.channel
    const args = message.content.slice(config.prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()

    channel.startTyping()

    if (command === 'pinyin' || command === 'zh') {
        message.delete(10000)
        if (!args.length) {
            return botMessageSend(`You didn't provide any arguments.`, channel, 10000)
        } else {
            botMessageSend(`${message.content}\n${pinyin(args.join()).join(' ')}`, channel, 0)
        }
    } else if (command === 'word' || command === 'w') {
        message.delete(10000)
        if (args[0] === 'jp' || args[0] === 'j') {
            reciveCommand(message, channel, GAS_URL_JP)//JP
        } else if (args[0] === 'zh' || args[0] === 'z') {
            reciveCommand(message, channel, GAS_URL_ZH)//ZH
        } else if (args[0] === 'en' || args[0] === 'e') {
            reciveCommand(message, channel, GAS_URL_EN)//EN
        } else {
            reciveCommand(message, channel, GAS_URL_JP)//JP
        }
    } else if (command === 't') {
        message.delete(10000)
        botMessageSend(`Hello`, channel, 5000)
    }
    channel.stopTyping()
    console.log(`${message.author.username}: ${message.cleanContent}`)
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

