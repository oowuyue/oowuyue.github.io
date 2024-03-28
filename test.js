const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')
const {
    wait
} = require("./eco7/ajslib/my.js")
const nodemailer = require("nodemailer");




/*
时间戳定义为从格林威治时间1970年01月01日00时00分00秒起至现在的总秒数。

因此，严格来说，不管你处在地球上的哪个地方，任意时间点的时间戳都是相同的。这点有利于线上和客户端分布式应用统一追踪时间信息。

但是不同的时区，当前时间戳对应的当前时间是不同的。
*/
console.log("时间戳：", new Date().getTime())




async function mySendMail111(msg) {
    let promise = new Promise(async (resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                pool: true,
                host: "smtp.163.com",
                port: 465,
                secure: true, // Use `true` for port 465, `false` for all other ports
                secureConnection: true,
                auth: {
                    user: "o111owuyue@163.com",
                    pass: "AEUORGVIOHTDGDGZ",  //qq8516 的：swvwmndqaedjbfii 
                },
            });
            transporter.sendMail({
                from: '"oowuyue" <oowuyue@163.com>', // sender address
                to: "3434384699@qq.com, 851616860@qq.com", // list of receivers
                subject: "Hello ✔", // Subject line
                text: msg, // plain text body
                html: msg, // html body
            }, (err, info) => {
                if (err) reject(err)
                else resolve(info)
            });

        } catch (error) {
            reject(error)
        }
    });
    return promise
}

(async () => {
    let mailRes = await mySendMail111("test")
})()








