let baostock_list = [
  ["2023-02-01", "7.4000", "7.4000", "7.3300", "7.3600"],
  ["2023-02-02", "7.3900", "7.3900", "7.3200", "7.3600"],
  ["2023-02-03", "7.3300", "7.3500", "7.2700", "7.2700"],
  ["2023-02-06", "7.2500", "7.2500", "7.2100", "7.2500"],
  ["2023-02-07", "7.2700", "7.2700", "7.2200", "7.2400"],
  ["2023-02-08", "7.2400", "7.2700", "7.2200", "7.2300"],
  ["2023-02-09", "7.2300", "7.2800", "7.2200", "7.2600"],
  ["2023-02-10", "7.2500", "7.2700", "7.2200", "7.2400"],
  ["2023-02-13", "7.2200", "7.2600", "7.1800", "7.2300"],
  ["2023-02-14", "7.2400", "7.2600", "7.2300", "7.2400"],
  ["2023-02-15", "7.2400", "7.2500", "7.1900", "7.2000"],
  ["2023-02-16", "7.2100", "7.2600", "7.1800", "7.1900"],
  ["2023-02-17", "7.1900", "7.2200", "7.1300", "7.1300"],
  ["2023-02-20", "7.1600", "7.2700", "7.1500", "7.2600"],
  ["2023-02-21", "7.2600", "7.3000", "7.2300", "7.2900"],
  ["2023-02-22", "7.2800", "7.2900", "7.2400", "7.2400"],
  ["2023-02-23", "7.2500", "7.2800", "7.2300", "7.2300"],
  ["2023-02-24", "7.2200", "7.2600", "7.1800", "7.1800"],
  ["2023-02-27", "7.1600", "7.2000", "7.1600", "7.1600"],
  ["2023-02-28", "7.1800", "7.2000", "7.1400", "7.1800"],
  ["2023-03-01", "7.1700", "7.2700", "7.1700", "7.2600"],
  ["2023-03-02", "7.2300", "7.2900", "7.2300", "7.2700"],
  ["2023-03-03", "7.2900", "7.3600", "7.2600", "7.3500"],
  ["2023-03-06", "7.3500", "7.3700", "7.3100", "7.3300"],
  ["2023-03-07", "7.3200", "7.4600", "7.3000", "7.3100"],
  ["2023-03-08", "7.3000", "7.3200", "7.2500", "7.3100"],
  ["2023-03-09", "7.3100", "7.3400", "7.2500", "7.2700"],
  ["2023-03-10", "7.2400", "7.2600", "7.1500", "7.1500"],
  ["2023-03-13", "7.0500", "7.0900", "7.0300", "7.0600"],
  ["2023-03-14", "7.0600", "7.0700", "7.0000", "7.0200"],
  ["2023-03-15", "7.0700", "7.1000", "7.0600", "7.0800"],
  ["2023-03-16", "7.0800", "7.1700", "7.0500", "7.1200"],
  ["2023-03-17", "7.1400", "7.2200", "7.1000", "7.1100"],
  ["2023-03-20", "7.1000", "7.2200", "7.1000", "7.1300"],
  ["2023-03-21", "7.1600", "7.2000", "7.1300", "7.1300"],
  ["2023-03-22", "7.1500", "7.1900", "7.1400", "7.1800"],
  ["2023-03-23", "7.1500", "7.2200", "7.1400", "7.2100"],
  ["2023-03-24", "7.1900", "7.2500", "7.1800", "7.2100"],
  ["2023-03-27", "7.2300", "7.2300", "7.1500", "7.1500"],
  ["2023-03-28", "7.1600", "7.1900", "7.1400", "7.1800"],
  ["2023-03-29", "7.2300", "7.2300", "7.1600", "7.1600"],
  ["2023-03-30", "7.1800", "7.2100", "7.1200", "7.1900"],
  ["2023-03-31", "7.1900", "7.2400", "7.1700", "7.1900"],
  ["2023-04-03", "7.1900", "7.2100", "7.1600", "7.1900"],
  ["2023-04-04", "7.1900", "7.2200", "7.1600", "7.2100"],
  ["2023-04-06", "7.2100", "7.2200", "7.1800", "7.1800"],
  ["2023-04-07", "7.1900", "7.2400", "7.1600", "7.2300"],
  ["2023-04-10", "7.2100", "7.2400", "7.1900", "7.2100"],
  ["2023-04-11", "7.2300", "7.2300", "7.1800", "7.1800"],
  ["2023-04-12", "7.2000", "7.2300", "7.1700", "7.2100"],
  ["2023-04-13", "7.2200", "7.2900", "7.2000", "7.2500"],
  ["2023-04-14", "7.2800", "7.3100", "7.2500", "7.2700"],
  ["2023-04-17", "7.2600", "7.4000", "7.2600", "7.3900"],
  ["2023-04-18", "7.3800", "7.5900", "7.3700", "7.5400"],
  ["2023-04-19", "7.4900", "7.5800", "7.4300", "7.5300"],
  ["2023-04-20", "7.5000", "7.6900", "7.5000", "7.6800"],
  ["2023-04-21", "7.6700", "7.7300", "7.5700", "7.5900"],
  ["2023-04-24", "7.5900", "7.6400", "7.4700", "7.4900"],
  ["2023-04-25", "7.5300", "7.6200", "7.5200", "7.5600"],
  ["2023-04-26", "7.5600", "7.5600", "7.4200", "7.4600"],
  ["2023-04-27", "7.4800", "7.5100", "7.4200", "7.4800"],
  ["2023-04-28", "7.4700", "7.6500", "7.4700", "7.6000"],
  ["2023-05-04", "7.4800", "7.7500", "7.3500", "7.6800"],
  ["2023-05-05", "7.6800", "7.9000", "7.6600", "7.7600"],
  ["2023-05-08", "7.7700", "8.1700", "7.7600", "8.0700"],
  ["2023-05-09", "8.1400", "8.2200", "7.9400", "7.9600"],
  ["2023-05-10", "7.9300", "7.9500", "7.6500", "7.7000"],
  ["2023-05-11", "7.7200", "7.8000", "7.6500", "7.6700"],
  ["2023-05-12", "7.7000", "7.7100", "7.5800", "7.6200"],
  ["2023-05-15", "7.6200", "7.7100", "7.5100", "7.6900"],
  ["2023-05-16", "7.7000", "7.7800", "7.6400", "7.6700"],
  ["2023-05-17", "7.6700", "7.6900", "7.5800", "7.6100"],
  ["2023-05-18", "7.6400", "7.7500", "7.6100", "7.6800"],
  ["2023-05-19", "7.6700", "7.6700", "7.5200", "7.5400"],
  ["2023-05-22", "7.5800", "7.6000", "7.5200", "7.5400"],
  ["2023-05-23", "7.5400", "7.5900", "7.4500", "7.4500"],
  ["2023-05-24", "7.4300", "7.4400", "7.2900", "7.2900"],
  ["2023-05-25", "7.2600", "7.3300", "7.2400", "7.3100"],
  ["2023-05-26", "7.3100", "7.3600", "7.2500", "7.3200"],
  ["2023-05-29", "7.3200", "7.4600", "7.3100", "7.4100"],
  ["2023-05-30", "7.4200", "7.4400", "7.3000", "7.3700"],
  ["2023-05-31", "7.3700", "7.3700", "7.2900", "7.3500"],
  ["2023-06-01", "7.3300", "7.3500", "7.2600", "7.2800"],
  ["2023-06-02", "7.2900", "7.3600", "7.2900", "7.3500"],
  ["2023-06-05", "7.3500", "7.4300", "7.3100", "7.4100"],
  ["2023-06-06", "7.4100", "7.5300", "7.3600", "7.3800"],
  ["2023-06-07", "7.4000", "7.5000", "7.4000", "7.4600"],
  ["2023-06-08", "7.4900", "7.5900", "7.4300", "7.5700"],
  ["2023-06-09", "7.5700", "7.6000", "7.5300", "7.5600"],
  ["2023-06-12", "7.5400", "7.5400", "7.4300", "7.4300"],
  ["2023-06-13", "7.4300", "7.4800", "7.4000", "7.4600"],
  ["2023-06-14", "7.4800", "7.5100", "7.4000", "7.4000"],
  ["2023-06-15", "7.4300", "7.4900", "7.3900", "7.4500"],
  ["2023-06-16", "7.4500", "7.4700", "7.3900", "7.4300"],
  ["2023-06-19", "7.4100", "7.4200", "7.3400", "7.3400"],
  ["2023-06-20", "7.3600", "7.3700", "7.2900", "7.2900"],
  ["2023-06-21", "7.2900", "7.3700", "7.2700", "7.2700"],
  ["2023-06-26", "7.2700", "7.2800", "7.1400", "7.1600"],
  ["2023-06-27", "7.1500", "7.2300", "7.1400", "7.1900"],
  ["2023-06-28", "7.2000", "7.2200", "7.1500", "7.2100"],
  ["2023-06-29", "7.2100", "7.2500", "7.1800", "7.1800"],
  ["2023-06-30", "7.1700", "7.2700", "7.1700", "7.2400"],
  ["2023-07-03", "7.2500", "7.3300", "7.2500", "7.3200"],
  ["2023-07-04", "7.3000", "7.3300", "7.2300", "7.2800"],
  ["2023-07-05", "7.2600", "7.2800", "7.2100", "7.2500"],
  ["2023-07-06", "7.2500", "7.2700", "7.1900", "7.2100"],
  ["2023-07-07", "7.2100", "7.2500", "7.1800", "7.2200"],
  ["2023-07-10", "7.2200", "7.2500", "7.2000", "7.2200"],
  ["2023-07-11", "7.2600", "7.2900", "7.2300", "7.2800"],
  ["2023-07-12", "7.2800", "7.3200", "7.2500", "7.2500"],
  ["2023-07-13", "7.3000", "7.4000", "7.2700", "7.4000"],
  ["2023-07-14", "7.4200", "7.4500", "7.3800", "7.4400"],
  ["2023-07-17", "7.4400", "7.4500", "7.3500", "7.4200"],
  ["2023-07-18", "7.4200", "7.4200", "7.3700", "7.3900"],
  ["2023-07-19", "7.3600", "7.4300", "7.3600", "7.4100"],
  ["2023-07-20", "7.4300", "7.4800", "7.4000", "7.4200"],
  ["2023-07-21", "7.1000", "7.1500", "7.0700", "7.1200"],
  ["2023-07-24", "7.0800", "7.1600", "7.0700", "7.1300"],
  ["2023-07-25", "7.1800", "7.2900", "7.1700", "7.2700"],
  ["2023-07-26", "7.2800", "7.3400", "7.2600", "7.2900"],
  ["2023-07-27", "7.3300", "7.4000", "7.2900", "7.3700"],
  ["2023-07-28", "7.3300", "7.5200", "7.3300", "7.5000"],
  ["2023-07-31", "7.5500", "7.6400", "7.5200", "7.6000"],
  ["2023-08-01", "7.5800", "7.6300", "7.5400", "7.6000"],
  ["2023-08-02", "7.5600", "7.5900", "7.4300", "7.4800"],
  ["2023-08-03", "7.5200", "7.5800", "7.4400", "7.5600"],
  ["2023-08-04", "7.5900", "7.6500", "7.5400", "7.5800"],
  ["2023-08-07", "7.5700", "7.5700", "7.4900", "7.5200"],
  ["2023-08-08", "7.4700", "7.5500", "7.4300", "7.5200"],
  ["2023-08-09", "7.5000", "7.5500", "7.4700", "7.5500"],
  ["2023-08-10", "7.4500", "7.4600", "7.3500", "7.4200"],
  ["2023-08-11", "7.4400", "7.4400", "7.2300", "7.2300"],
  ["2023-08-14", "7.1800", "7.2000", "7.0500", "7.1000"],
  ["2023-08-15", "7.1200", "7.1900", "7.0900", "7.1700"],
  ["2023-08-16", "7.1500", "7.1900", "7.1200", "7.1400"],
  ["2023-08-17", "7.1300", "7.1400", "7.0500", "7.1000"],
  ["2023-08-18", "7.1000", "7.1700", "7.0700", "7.0700"],
  ["2023-08-21", "7.0600", "7.1100", "6.9600", "6.9600"],
  ["2023-08-22", "6.9800", "7.0400", "6.9700", "7.0100"],
  ["2023-08-23", "7.0100", "7.0900", "6.9800", "7.0200"],
  ["2023-08-24", "7.0300", "7.0600", "6.9800", "6.9900"],
  ["2023-08-25", "6.9900", "7.0900", "6.9700", "7.0500"],
  ["2023-08-28", "7.3000", "7.3200", "7.1200", "7.1500"],
  ["2023-08-29", "7.2000", "7.2000", "7.0300", "7.0700"],
  ["2023-08-30", "7.1000", "7.1000", "7.0100", "7.0300"],
  ["2023-08-31", "7.0300", "7.0900", "6.9800", "6.9800"],
  ["2023-09-01", "6.9900", "7.0400", "6.9900", "7.0100"],
  ["2023-09-04", "7.0600", "7.1400", "7.0300", "7.1100"],
  ["2023-09-05", "7.1000", "7.1200", "7.0300", "7.0400"],
  ["2023-09-06", "7.0200", "7.0900", "7.0200", "7.0900"],
  ["2023-09-07", "7.0900", "7.1000", "7.0200", "7.0400"],
  ["2023-09-08", "7.0300", "7.0500", "7.0000", "7.0000"],
  ["2023-09-11", "7.0200", "7.0900", "7.0000", "7.0400"],
  ["2023-09-12", "7.0300", "7.0700", "7.0300", "7.0600"],
  ["2023-09-13", "7.0900", "7.1000", "7.0400", "7.0500"],
  ["2023-09-14", "7.0800", "7.1200", "7.0600", "7.1100"],
  ["2023-09-15", "7.1200", "7.1600", "7.0700", "7.1200"],
  ["2023-09-18", "7.0900", "7.1000", "7.0300", "7.0700"],
  ["2023-09-19", "7.0800", "7.1300", "7.0500", "7.1300"],
  ["2023-09-20", "7.1200", "7.1500", "7.0800", "7.1300"],
  ["2023-09-21", "7.1300", "7.1700", "7.0900", "7.1000"],
  ["2023-09-22", "7.1000", "7.1800", "7.0700", "7.1800"],
  ["2023-09-25", "7.1800", "7.2000", "7.1300", "7.1600"],
  ["2023-09-26", "7.1700", "7.1900", "7.1200", "7.1500"],
  ["2023-09-27", "7.1900", "7.1900", "7.1100", "7.1300"],
  ["2023-09-28", "7.1500", "7.1700", "7.1000", "7.1000"],
  ["2023-10-09", "7.0800", "7.0800", "7.0000", "7.0300"],
  ["2023-10-10", "7.1300", "7.1400", "7.0100", "7.0100"],
  ["2023-10-11", "7.0600", "7.0800", "7.0100", "7.0200"],
  ["2023-10-12", "7.0900", "7.1700", "7.0600", "7.1400"],
  ["2023-10-13", "7.1100", "7.1500", "7.0800", "7.1000"],
  ["2023-10-16", "7.1200", "7.1300", "7.0400", "7.0700"],
  ["2023-10-17", "7.0900", "7.1000", "7.0500", "7.0900"],
  ["2023-10-18", "7.0700", "7.1100", "7.0500", "7.0500"],
  ["2023-10-19", "7.0400", "7.0500", "6.8300", "6.8400"],
];

let akshare_list = [
  {
    日期: "2021-11-09T00:00:00.000",
    开盘: 3009.83,
    收盘: 3017.96,
    最高: 3037.46,
    最低: 2974.07,
    成交量: 1240573,
    成交额: 2163193120.0,
    振幅: 2.11,
    涨跌幅: 0.6,
    涨跌额: 17.88,
    换手率: 0.64,
  },
  {
    日期: "2021-11-10T00:00:00.000",
    开盘: 3006.58,
    收盘: 2996.83,
    最高: 3008.2,
    最低: 2957.82,
    成交量: 1220851,
    成交额: 2109735152.0,
    振幅: 1.67,
    涨跌幅: -0.7,
    涨跌额: -21.13,
    换手率: 0.63,
  },
  {
    日期: "2021-11-11T00:00:00.000",
    开盘: 2988.7,
    收盘: 3151.23,
    最高: 3164.23,
    最低: 2983.82,
    成交量: 2084729,
    成交额: 3752413856.0,
    振幅: 6.02,
    涨跌幅: 5.15,
    涨跌额: 154.4,
    换手率: 1.07,
  },
  {
    日期: "2021-11-12T00:00:00.000",
    开盘: 3144.73,
    收盘: 3138.23,
    最高: 3196.74,
    最低: 3112.22,
    成交量: 957546,
    成交额: 1753072720.0,
    振幅: 2.68,
    涨跌幅: -0.41,
    涨跌额: -13.0,
    换手率: 0.49,
  },
  {
    日期: "2021-11-15T00:00:00.000",
    开盘: 3151.23,
    收盘: 3164.23,
    最高: 3196.74,
    最低: 3126.85,
    成交量: 655090,
    成交额: 1203764096.0,
    振幅: 2.23,
    涨跌幅: 0.83,
    涨跌额: 26.0,
    换手率: 0.34,
  },
  {
    日期: "2021-11-16T00:00:00.000",
    开盘: 3152.85,
    收盘: 3130.1,
    最高: 3182.11,
    最低: 3121.97,
    成交量: 601110,
    成交额: 1099113408.0,
    振幅: 1.9,
    涨跌幅: -1.08,
    涨跌额: -34.13,
    换手率: 0.31,
  },
  {
    日期: "2021-11-17T00:00:00.000",
    开盘: 3118.72,
    收盘: 3112.22,
    最高: 3143.1,
    最低: 3091.09,
    成交量: 664640,
    成交额: 1203859184.0,
    振幅: 1.66,
    涨跌幅: -0.57,
    涨跌额: -17.88,
    换手率: 0.34,
  },
  {
    日期: "2021-11-18T00:00:00.000",
    开盘: 3108.97,
    收盘: 3061.84,
    最高: 3113.85,
    最低: 3050.46,
    成交量: 799844,
    成交额: 1430058304.0,
    振幅: 2.04,
    涨跌幅: -1.62,
    涨跌额: -50.38,
    换手率: 0.41,
  },
  {
    日期: "2021-11-19T00:00:00.000",
    开盘: 3061.84,
    收盘: 3118.72,
    最高: 3133.35,
    最低: 3045.58,
    成交量: 786372,
    成交额: 1414506384.0,
    振幅: 2.87,
    涨跌幅: 1.86,
    涨跌额: 56.88,
    换手率: 0.41,
  },
  {
    日期: "2021-11-22T00:00:00.000",
    开盘: 3099.22,
    收盘: 3113.85,
    最高: 3134.97,
    最低: 3078.09,
    成交量: 738618,
    成交额: 1337768176.0,
    振幅: 1.82,
    涨跌幅: -0.16,
    涨跌额: -4.87,
    换手率: 0.38,
  },
  {
    日期: "2021-11-23T00:00:00.000",
    开盘: 3112.22,
    收盘: 3074.84,
    最高: 3151.23,
    最低: 3042.33,
    成交量: 1235978,
    成交额: 2213817584.0,
    振幅: 3.5,
    涨跌幅: -1.25,
    涨跌额: -39.01,
    换手率: 0.64,
  },
  {
    日期: "2021-11-24T00:00:00.000",
    开盘: 3056.96,
    收盘: 3073.21,
    最高: 3086.22,
    最低: 3039.08,
    成交量: 741311,
    成交额: 1316774400.0,
    振幅: 1.53,
    涨跌幅: -0.05,
    涨跌额: -1.63,
    换手率: 0.38,
  },
  {
    日期: "2021-11-25T00:00:00.000",
    开盘: 3052.09,
    收盘: 3042.33,
    最高: 3060.21,
    最低: 3034.21,
    成交量: 603533,
    成交额: 1068221312.0,
    振幅: 0.85,
    涨跌幅: -1.0,
    涨跌额: -30.88,
    换手率: 0.31,
  },
  {
    日期: "2021-11-26T00:00:00.000",
    开盘: 3032.58,
    收盘: 3026.08,
    最高: 3040.71,
    最低: 3016.33,
    成交量: 694500,
    成交额: 1219937312.0,
    振幅: 0.8,
    涨跌幅: -0.53,
    涨跌额: -16.25,
    换手率: 0.36,
  },
  {
    日期: "2021-11-29T00:00:00.000",
    开盘: 2998.45,
    收盘: 3014.7,
    最高: 3024.46,
    最低: 2990.33,
    成交量: 512595,
    成交额: 895105984.0,
    振幅: 1.13,
    涨跌幅: -0.38,
    涨跌额: -11.38,
    换手率: 0.26,
  },
  {
    日期: "2021-11-30T00:00:00.000",
    开盘: 3019.58,
    收盘: 3003.33,
    最高: 3042.33,
    最低: 2988.7,
    成交量: 733616,
    成交额: 1280384560.0,
    振幅: 1.78,
    涨跌幅: -0.38,
    涨跌额: -11.37,
    换手率: 0.38,
  },
  {
    日期: "2021-12-01T00:00:00.000",
    开盘: 3001.7,
    收盘: 3035.83,
    最高: 3056.96,
    最低: 2991.95,
    成交量: 706925,
    成交额: 1243666848.0,
    振幅: 2.16,
    涨跌幅: 1.08,
    涨跌额: 32.5,
    换手率: 0.36,
  },
  {
    日期: "2021-12-02T00:00:00.000",
    开盘: 3032.58,
    收盘: 3027.71,
    最高: 3063.46,
    最低: 2991.95,
    成交量: 994798,
    成交额: 1749164560.0,
    振幅: 2.36,
    涨跌幅: -0.27,
    涨跌额: -8.12,
    换手率: 0.51,
  },
  {
    日期: "2021-12-03T00:00:00.000",
    开盘: 3035.83,
    收盘: 3037.46,
    最高: 3045.58,
    最低: 2998.45,
    成交量: 707600,
    成交额: 1242375056.0,
    振幅: 1.56,
    涨跌幅: 0.32,
    涨跌额: 9.75,
    换手率: 0.36,
  },
  {
    日期: "2021-12-06T00:00:00.000",
    开盘: 3069.96,
    收盘: 3110.6,
    最高: 3185.36,
    最低: 3061.84,
    成交量: 2145625,
    成交额: 3896385168.0,
    振幅: 4.07,
    涨跌幅: 2.41,
    涨跌额: 73.14,
    换手率: 1.11,
  },
  {
    日期: "2021-12-07T00:00:00.000",
    开盘: 3143.1,
    收盘: 3169.11,
    最高: 3203.24,
    最低: 3118.72,
    成交量: 1616444,
    成交额: 2979968976.0,
    振幅: 2.72,
    涨跌幅: 1.88,
    涨跌额: 58.51,
    换手率: 0.83,
  },
  {
    日期: "2021-12-08T00:00:00.000",
    开盘: 3167.48,
    收盘: 3170.73,
    最高: 3183.73,
    最低: 3120.35,
    成交量: 980281,
    成交额: 1798691056.0,
    振幅: 2.0,
    涨跌幅: 0.05,
    涨跌额: 1.62,
    换手率: 0.51,
  },
  {
    日期: "2021-12-09T00:00:00.000",
    开盘: 3173.98,
    收盘: 3208.11,
    最高: 3266.62,
    最低: 3154.48,
    成交量: 1455887,
    成交额: 2726663440.0,
    振幅: 3.54,
    涨跌幅: 1.18,
    涨跌额: 37.38,
    换手率: 0.75,
  },
];
