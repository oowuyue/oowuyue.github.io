import baostock as bs
import pandas as pd
import numpy as np
import json


#### 登陆系统 ####
lg = bs.login()
# 显示登陆返回信息
print('login respond error_code:'+lg.error_code)
print('login respond  error_msg:'+lg.error_msg)


#### 获取历史K线数据 ####
# 详细指标参数，参见“历史行情指标参数”章节
rs = bs.query_history_k_data_plus("sh.600000",
                                  "date,open,high,low,close,volume",
                                  start_date='2019-01-01', end_date='2023-10-24',
                                  frequency="d", adjustflag="3")  # frequency="d"取日k线，adjustflag="3"默认不复权
print('query_history_k_data_plus respond error_code:'+rs.error_code)
print('query_history_k_data_plus respond  error_msg:'+rs.error_msg)

#### 打印结果集 ####
data_list = []
while (rs.error_code == '0') & rs.next():
    # 获取一条记录，将记录合并在一起
    data_list.append(rs.get_row_data())

# with open('testData.js', 'w', encoding='utf-8') as f:
#     f.write('let data_list = '+json.dumps(data_list, ensure_ascii=False))



result = pd.DataFrame(data_list, columns=rs.fields)
#### 结果集输出到csv文件 ####
result.to_csv("./sh600000.csv", index=False)
print(result)

#### 登出系统 ####
bs.logout()
