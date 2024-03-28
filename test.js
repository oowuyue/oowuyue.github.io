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







console.log("时间戳：", new Date().getTime())


try {
    const obj = {};
    obj.concat([1]); // Uncaught TypeError: obj.concat is not a function
} catch (error) {
    console.error("console.error444:", error)  //github 不发错误
}


console.error("console.error特色图:", new Error("error特色图"))




