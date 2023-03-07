import pandas as pd
from datetime import datetime
from datetime import timedelta
import yfinance as yf
from dataset_creation import nasdaq100_crawling


# Execute "nasdaq100_crawling" Module
nasdaq_dic = pd.DataFrame(nasdaq100_crawling.get_nasdaq100())
# Get Nasdaq 100 List
nasdaq100_symbols = list(nasdaq_dic.ticker)









# 데모에서 메뉴에서 필요한 정보들
# Ticker, Name, Diff, Open, Close, Sector, Industry, Date
def get_list(tickers=nasdaq100_symbols):
    demo_dic = pd.DataFrame(nasdaq100_crawling.get_nasdaq100())

    for i in range(len(demo_dic.index)):
        ticker = demo_dic.loc[i, 'ticker']

        # ticker의 주식 정보 데이터를 가져온다.
        data = get_data(tickers=[ticker], numOfDay=2)[0]

        try:
            yesterday = data.iloc[-2, 3]
            today = data.iloc[-1, 3]
        except IndexError:
            print("Oops!  That was no valid number.  Try again...")
            from IPython import embed; embed()


        demo_dic.loc[i, 'diff'] = round(((today-yesterday)/today) * 100.0, 2)
        demo_dic.loc[i, 'open'] = round(data.iloc[-1, 0], 2) # Open
        demo_dic.loc[i, 'close'] = round(data.iloc[-1, 3], 2) # Close
        date = str(data.index[-1].year) + "-" + str(data.index[-1].month) + "-" + str(data.index[-1].day)
        demo_dic.loc[i, 'date'] = date # Date

    return demo_dic



# 주식 데이터 가져오기
def get_data(tickers=nasdaq100_symbols, numOfDay=2):#numOfDay: 날짜 간격
    output = []
    delta = (numOfDay / 7) * 2

    # 시작 날짜 ~ 최근까지 데이터 가져오기
    now = datetime.now() # 오늘 날짜
    date = now.weekday() # 요일 확인

    if date == 5: # Saturday
        start_date = datetime(now.year, now.month, now.day, 0, 0) - timedelta(days=numOfDay+4+delta)
        end_date = datetime(now.year, now.month, now.day, 0, 0)
    elif date == 6 or date == 0 or date == 1: # Sunday or Monday or Tuesday
        start_date = datetime(now.year, now.month, now.day, 0, 0) - timedelta(days=numOfDay+5+delta)
        end_date = datetime(now.year, now.month, now.day, 0, 0)
    else: # Others
        start_date = datetime(now.year, now.month, now.day, 0, 0) - timedelta(days=numOfDay+3+delta)
        end_date = datetime(now.year, now.month, now.day, 0, 0)


    # Check if it is included in the Nasdaq_100
    for ticker in tickers:
        ticker = ticker.upper()
        if ticker not in nasdaq100_symbols:
            print("Nasdaq 100 안에 포함되지 않습니다 ")
        else:
            print("[ {} Finance Data ]".format(ticker))
            ticker_yf = yf.Tickers(ticker)

            abc = ticker_yf.tickers[ticker].history(start=start_date, end=end_date, period='max')

            output.append(abc)

    # print("Output : ", output)
    # from IPython import embed; embed()
    if numOfDay != 60 and len(list(output[0].index.values)) < numOfDay:
        print(numOfDay+numOfDay-len(list(output[0].index.values)))
        output = get_data(tickers, numOfDay+numOfDay-len(list(output[0].index.values)))
    return output

































if __name__ == '__main__':
    print(get_list())

    start_date = datetime(2021,1,1) 
    end_date = datetime(2023,2,3)
    
    get_data(['meta'], numOfDay=2)
    get_data(tickers=nasdaq100_symbols, numOfDay=2)