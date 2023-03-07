from bs4 import BeautifulSoup
import urllib.request
import pandas as pd
from tqdm import trange
import datetime
import os
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

import nasdaq100_crawling

nasdaq_url = "https://www.marketscreener.com/quote/index/NASDAQ-100-4946/components/col=7&asc=0&fpage={}"



# Ticker 마다 뉴스 기사 목록 사이트 확인하기
def get_codezb():
    # Execute "nasdaq100_crawling" Module
    nasdaq_dic = pd.DataFrame(nasdaq100_crawling.get_nasdaq100())
    # Get Nasdaq 100 List
    nasdaq100_codezb = pd.DataFrame(index=nasdaq_dic.ticker, columns=['url'])

    count=0
    for page in trange(1, 4):
        print("page : ", page)
        url = nasdaq_url.format(page)

        # html 정보 가져오기
        html = urllib.request.urlopen(url).read()
        soup = BeautifulSoup(html, 'html.parser')

        # 한 페이지에 50개 목록
        row = soup.select('table [class="tabBodyLV17"] tr')
        for idx in trange(1, len(row)):
            count+=1
            # 해당 회사의 url
            idx_url = "https://www.marketscreener.com" + row[idx].select('td')[1].find('a')['href']

            # html 정보 가져오기
            idx_html = urllib.request.urlopen(idx_url).read()
            idx_soup = BeautifulSoup(idx_html, 'html.parser')

            ticker = idx_soup.select('span [class=fvTitleInfo]')[0].text

            nasdaq100_codezb.loc[ticker, 'url'] = idx_url + "news-quality/"
    
    nasdaq100_codezb.to_csv('./dataset_creation/nasdaq_url.tsv', index=True, sep='\t')
    print("{} / {}".format(count, len(nasdaq_dic.ticker)))
    from IPython import embed; embed()




# 문자열 길이 확인 그리고 뉴스 기사 길이
def get_textLength_and_newsCount():
    total_count=0
    ranking = {}
    newsTextLengthList = []

    dir = './news'
    for ticker in os.listdir(dir):
        ticker_count=0
        tickerTextLength_avg=0.0

        dir2 = os.path.join(dir, ticker)
        if ticker == ".DS_Store":
                os.remove(dir2) #파일삭제
                continue

        for date in os.listdir(dir2):

            dir3 = os.path.join(dir2, date)
            if date == ".DS_Store":
                os.remove(dir3) #파일삭제
                continue

            if date < "2023.01.01":
                for title in os.listdir(dir3):
                    remove_dic = os.path.join(dir3, title)
                    os.remove(remove_dic) #파일삭제
                os.rmdir(dir3) #해당 directory 삭제
                continue

            # print(date)
            for title in os.listdir(dir3):
                dir4=os.path.join(dir3, title)

                f = open(dir4, 'r')
                data = f.read()
                length = len(data)

                newsTextLengthList.append(length)
                tickerTextLength_avg+=length
                
                ticker_count+=1
                total_count+=1

        avg = 0.0
        if ticker_count != 0:
            avg = tickerTextLength_avg/ticker_count
        ranking[ticker]=[ticker_count, avg]

    print("Ranking\t| Ticker\t| # of news\t| Average of News Text Length")
    sorted_pairs = sorted(ranking.items(), key=lambda x: -x[1][0])
    tickers, values = [], []
    for i, (ticker, element) in enumerate(sorted_pairs, start=1):
        tickers.append(ticker)
        values.append(element[0])
        print("{}\t{}\t{}\t{:.2f}".format(i, ticker, element[0], element[1]))



    # Draw Graph
    x = np.arange(len(os.listdir(dir)))

    plt.figure(figsize=(14, 6)) # Size of Window

    plt.bar(x=x, height=values, color='C2') # 막대그래프 그리기
    plt.xticks(ticks=x, labels=tickers, rotation=90, fontsize=5) # X값 표시
    plt.tick_params(axis='x', direction='in', length=3, pad=6, labelcolor='blue')

    plt.title("Number of News Data ( NASDAQ 100 )") # Write Title
    plt.xlabel('Tickers') # Write X-axis
    plt.ylabel('# of News') # Write Y-axis
    plt.show()

    # Show Total Number of News and News Text Length
    print("======================================================")
    print("{} : {}".format("전체 뉴스 갯수", total_count))
    
    df = pd.DataFrame(ranking, index=["Number of News", "Average of News Text Length"])
    df = df.transpose()
    df.to_excel("dataset_creation/tickers_numAndAvg.xlsx")
    print(df["Number of News"].describe())

    text_length_df = pd.DataFrame(newsTextLengthList, columns=["News Text Length"])
    print(text_length_df.describe())
    text_length_df.to_excel("dataset_creation/textLength.xlsx")

    from IPython import embed; embed()








def get_news(tickers, boundary_date='2023.01.01'):
    if not os.path.exists('./news'):
        os.mkdir('./news')

    # NASDAQ Tickers List 가져오기
    nasdaq100_codezb = pd.read_csv('./dataset_creation/nasdaq_url.tsv', sep='\t', index_col='ticker')
    nasdaq_tickers = list(nasdaq100_codezb.index)

    total_count=0
    for ticker in tickers:
        num=0
        print("============================== {} ==============================".format(ticker))
        # 해당 Ticker 의 Directory 가 존재하는지 확인
        if not os.path.exists('./news/' + ticker):
            os.mkdir('./news/' + ticker)

        # 해당 Ticker 가 NASDAQ Tickers List 에 존재하지 않을 때, 
        if ticker not in nasdaq_tickers:
            print("[ Check NASDAQ Tickers List ]")
            print(ticker, "is not in NASDAQ 100")
            from IPython import embed; embed()

        # 해당 Ticker 가 News URL 을 가지고 있지 않을 때, 
        if pd.isna(nasdaq100_codezb.loc[ticker, 'url']):
            print("[ Check get_codezb() Method ]")
            print(ticker, "has not News URL")

            if ticker == "TEAM":
                nasdaq100_codezb.loc[ticker, 'url']="https://www.marketscreener.com/quote/stock/ATLASSIAN-CORPORATION-25531314/news-quality/"
            elif ticker == "BKR":
                nasdaq100_codezb.loc[ticker, 'url']="https://www.marketscreener.com/quote/stock/BAKER-HUGHES-COMPANY-40311111/news-quality/"
            elif ticker == "CSGP":
                nasdaq100_codezb.loc[ticker, 'url']="https://www.marketscreener.com/quote/stock/COSTAR-GROUP-INC-8923/news-quality/"
            elif ticker == "FANG":
                nasdaq100_codezb.loc[ticker, 'url']="https://www.marketscreener.com/quote/stock/DIAMONDBACK-ENERGY-INC-11732858/news-quality/"
            elif ticker == "ENPH":
                nasdaq100_codezb.loc[ticker, 'url']="https://www.marketscreener.com/quote/stock/ENPHASE-ENERGY-INC-10335237/news-quality/"
            elif ticker == "GFS":
                nasdaq100_codezb.loc[ticker, 'url']="https://www.marketscreener.com/quote/stock/GLOBALFOUNDRIES-INC-128691269/news-quality/"
            elif ticker == "RIVN":
                nasdaq100_codezb.loc[ticker, 'url']="https://www.marketscreener.com/quote/stock/RIVIAN-AUTOMOTIVE-INC-129226108/news-quality/"
            elif ticker == "WBD":
                nasdaq100_codezb.loc[ticker, 'url']="https://www.marketscreener.com/quote/stock/WARNER-BROS-DISCOVERY-I-136094563/news-quality/"
            else: from IPython import embed; embed()
            



        # 해당 Ticker News URL 가져오기
        url = nasdaq100_codezb.loc[ticker, 'url'] + "&&fpage={}"

        page=0
        stop=False
        while (True):
            page+=1
            print("URL : {}".format(url.format(page)))

            # html 정보 가져오기
            html = urllib.request.urlopen(url.format(page)).read()
            soup = BeautifulSoup(html, 'html.parser')


            # 한 페이지에 있는 뉴스 리스트
            news_list = soup.select('td[class="std_txt th_inner"]')[0].select('table[class="tabBody"] tr')
            for news in news_list:
                # 1. Date
                date = news.select('td')[0].text

                if ':' in date:
                    today = datetime.datetime.now()
                    today = today.strftime("%Y.%m.%d")
                    date = today
                elif '/' in date:
                    date = date.replace('/', '.')
                    today = datetime.datetime.now()
                    today = today.strftime("%Y")
                    date = today + "." + date
                else:
                    # XXX : 전년도는 해결하지 못함
                    date = date + ".12.12"#임시날짜


                # boundary_date 이후만 크롤링
                if date < boundary_date:
                    stop=True
                    break
                


                # 2. URL
                news_url = "https://www.marketscreener.com/" + news.select('td')[1].select('a')[0]['href']
                

                # 3. Title
                news_title = news.select('td')[1].text

                if '…' in news_title:
                    news_title = news_title.replace('/…', '')
                if '/' in news_title:
                    news_title = news_title.replace('/', '|')


                # 4. News Form
                news_form = news.select('td')[2].text


                # A) 크롤링하기 전에, Directory 존재하는지 확인해보기
                if not os.path.exists('./news/{}/{}'.format(ticker, date)):
                    os.mkdir('./news/{}/{}'.format(ticker, date))


                # B) 해당 Ticker, Date, Title의 URL을 따로 저장
                save_news_url(ticker, date, news_url, news_title)


                # C) 여기서부터 뉴스 내용 크롤링
                if news_form == 'MT':
                    # 제목만 있고 뉴스 기사는 없음
                    # 일단 Pass
                    pass

                elif news_form == 'MD':
                    get_md(ticker, date, news_url, news_title)
                    num+=1

                elif news_form == 'RE':
                    get_re(ticker, date, news_url, news_title)
                    num+=1

                elif news_form == 'AQ':
                    get_aq(ticker, date, news_url, news_title)
                    num+=1

                elif news_form == 'DJ':
                    # 뉴스 기사들을 요약한 내용들을 모아둔거여서
                    # 크롤링을 안해도 괜찮을 것 같음
                    # => 일단 보류
                    pass

                elif (news_form == '') or (news_form == 'PR')or (news_form == 'PU'):
                    get_(ticker, date, news_url, news_title)
                    num+=1

                elif news_form == 'AN':
                    get_an(ticker, date, news_url, news_title)
                    num+=1

                elif news_form == 'CI':
                    # 구독을 해야지 확인할 수 있음
                    # 크롤링이 안됨
                    pass

                elif news_form == 'BU':
                    get_bu(ticker, date, news_url, news_title)
                    num+=1

                else:
                    print('Pass. {}'.format(news_form))
                    continue
                    
            if stop: break
        print("\nNumber of Crawling News : {}".format(num))
        total_count+=num
    
    return total_count














# 해당 Ticker, Date, Title의 URL을 따로 저장
def save_news_url(ticker, date, url, title):
    dir = "dataset_creation/save_news_url.tsv"

    if not os.path.exists(dir):
        df = pd.DataFrame(columns=['ticker', 'date', 'title', 'url'])
    else:
        df = pd.read_csv(dir, sep='\t', index_col=0)

    filt = (df['ticker'] == ticker) & (df['date'] == date) & (df['title'] == title)

    # 처음으로 저장할 때
    if len(df[filt]) == 0:
        df.loc[len(df)] = [ticker, date, title, url]
    # 기존에 저장되어 있었다면, 다시 업데이트
    else:
        df.loc[filt, 'url'] = url

    df.to_csv(dir, sep='\t')
    



























def get_md(ticker, date, url, title):
    # 제목이 존재한다면, Pass
    if os.path.exists('./news/{}/{}/{}.txt'.format(ticker, date, title)):
        return

    # html 정보 가져오기
    html = urllib.request.urlopen(url).read()
    soup = BeautifulSoup(html, 'html.parser')

    # 검사
    a=soup.select('span[class=clearfix]')
    if len(a) != 1:
        print("ticker : {}, date : {}, url : {}, title : {}".format(ticker, date, url, title))
        from IPython import embed; embed()
        return
    a=soup.select('span[class=clearfix]')[0].select('div[id=grantexto]')
    if len(a) != 1:
        print("ticker : {}, date : {}, url : {}, title : {}".format(ticker, date, url, title))
        from IPython import embed; embed()
        return
    a=soup.select('span[class=clearfix]')[0].select('div[id=grantexto]')[0].select('p')
    if len(a) != 1:
        print("ticker : {}, date : {}, url : {}, title : {}".format(ticker, date, url, title))
        from IPython import embed; embed()
        return

    # 시작
    text = soup.select('span[class=clearfix]')[0].select('div[id=grantexto]')[0].select('p')[0].text

    file = open('./news/{}/{}/{}.txt'.format(ticker, date, title), 'w')
    file.write(text)
    file.close()



def get_re(ticker, date, url, title):
    # 제목이 존재한다면, Pass
    if os.path.exists('./news/{}/{}/{}.txt'.format(ticker, date, title)):
        return

    # html 정보 가져오기
    html = urllib.request.urlopen(url).read()
    soup = BeautifulSoup(html, 'html.parser')

    # 검사
    a=soup.select('div[id=grantexto]')
    if len(a) != 1:
        print("ticker : {}, date : {}, url : {}, title : {}".format(ticker, date, url, title))
        from IPython import embed; embed()

    # 시작
    text_list=soup.select('div[id=grantexto] p')
    text = ''
    for i in range(len(text_list)):
        text = text + text_list[i].text

    file = open('./news/{}/{}/{}.txt'.format(ticker, date, title), 'w')
    file.write(text)
    file.close()



def get_aq(ticker, date, url, title):
    # 제목이 존재한다면, Pass
    if os.path.exists('./news/{}/{}/{}.txt'.format(ticker, date, title)):
        return

    # html 정보 가져오기
    html = urllib.request.urlopen(url).read()
    soup = BeautifulSoup(html, 'html.parser')

    # 검사
    a=soup.select('div[id=grantexto]')
    if len(a) != 1:
        print("ticker : {}, date : {}, url : {}, title : {}".format(ticker, date, url, title))
        from IPython import embed; embed()

    # 시작
    text_list=soup.select('div[id=grantexto] p')
    text = ''
    for i in range(len(text_list)):
        text = text + text_list[i].text

    file = open('./news/{}/{}/{}.txt'.format(ticker, date, title), 'w')
    file.write(text)
    file.close()




def get_(ticker, date, url, title):
    # 제목이 존재한다면, Pass
    if os.path.exists('./news/{}/{}/{}.txt'.format(ticker, date, title)):
        return

    # html 정보 가져오기
    html = urllib.request.urlopen(url).read()
    soup = BeautifulSoup(html, 'html.parser')

    # 검사
    a=soup.select('div[id=grantexto]')
    if len(a) != 1:
        print("ticker : {}, date : {}, url : {}, title : {}".format(ticker, date, url, title))
        from IPython import embed; embed()
    
    # 시작
    text = a[0].text

    file = open('./news/{}/{}/{}.txt'.format(ticker, date, title), 'w')
    file.write(text)
    file.close()



def get_an(ticker, date, url, title):
    # 제목이 존재한다면, Pass
    if os.path.exists('./news/{}/{}/{}.txt'.format(ticker, date, title)):
        return

    # html 정보 가져오기
    html = urllib.request.urlopen(url).read()
    soup = BeautifulSoup(html, 'html.parser')

    # 검사
    a=soup.select('div[id=grantexto]')
    if len(a) != 1:
        print("ticker : {}, date : {}, url : {}, title : {}".format(ticker, date, url, title))
        from IPython import embed; embed()

    # 시작
    text_list=soup.select('div[id=grantexto] p')
    text = ''
    for i in range(len(text_list)):
        text = text + text_list[i].text

    file = open('./news/{}/{}/{}.txt'.format(ticker, date, title), 'w')
    file.write(text)
    file.close()


def get_bu(ticker, date, url, title):
    # 제목이 존재한다면, Pass
    if os.path.exists('./news/{}/{}/{}.txt'.format(ticker, date, title)):
        return

    # html 정보 가져오기
    html = urllib.request.urlopen(url).read()
    soup = BeautifulSoup(html, 'html.parser')

    # 검사
    a=soup.select('div[id=grantexto]')
    if len(a) != 1:
        print("ticker : {}, date : {}, url : {}, title : {}".format(ticker, date, url, title))
        from IPython import embed; embed()

    # 시작
    text_list=soup.select('div[id=grantexto] p')
    text = ''
    for i in range(len(text_list)):
        text = text + text_list[i].text

    file = open('./news/{}/{}/{}.txt'.format(ticker, date, title), 'w')
    file.write(text)
    file.close()





















if __name__ == '__main__':
    get_textLength_and_newsCount()


    # get_codezb()

    nasdaq_dic = pd.DataFrame(nasdaq100_crawling.get_nasdaq100())
    nasdaq100_tickers = list(nasdaq_dic.ticker)
    # total_count=get_news(nasdaq100_tickers)
    total_count=get_news(nasdaq100_tickers, boundary_date="2023.01.01")


    # tickers = ['ADP', 'AAPL', 'META']
    # total_count=get_news(tickers)


    print("total_count : ", total_count)
    print("Finish")