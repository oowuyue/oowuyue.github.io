import akshare as ak

stock_zh_a_hist_df = ak.stock_zh_a_hist(symbol="000001", period="daily", start_date="20170301", end_date='20210907', adjust="")
print(stock_zh_a_hist_df)


# AKTools http://127.0.0.1:8080/api/public/stock_zh_a_hist?symbol=000001&period=daily&start_date=%2020211109&end_date=%2020211209&adjust=hfq