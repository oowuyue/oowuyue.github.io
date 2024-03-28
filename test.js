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










var getCurrentZoneTime = function (zone) {
    var timezone = zone; //目标时区
    var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
    var nowDate = new Date().getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
    var targetDate = new Date(nowDate + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000);  //当前东八区的时间
    var current = targetDate.getTime();  //当前时区时间戳
    console.log(current)
    return current
}


console.log("utc0时间戳", getCurrentZoneTime(0))

console.log("东八区当前时间戳", getCurrentZoneTime(8))


try {
    const obj = {};
    obj.concat([1]); // Uncaught TypeError: obj.concat is not a function
} catch (error) {
    console.error("console.error444:" ,error)
}



