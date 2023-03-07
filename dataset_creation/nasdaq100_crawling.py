from bs4 import BeautifulSoup
import urllib.request
import pandas as pd

url = "https://en.wikipedia.org/wiki/Nasdaq-100"

def get_nasdaq100():
    # Set List
    SP500_list = []

    # html 정보 가져오기
    html = urllib.request.urlopen(url).read()
    soup = BeautifulSoup(html, 'html.parser')

    # html에서 table 정보 가져오기
    table = soup.findAll("table", {"class": "wikitable sortable"})[2]

    for row in table.findAll("tr")[1:]:

        ticker = get_ticker(row)
        name = get_name(row)
        sector = get_sector(row)
        industry = get_industry(row)

        SP500_list.append(return_comment_form(ticker, name, sector, industry))

    return SP500_list





def return_comment_form(ticker, name, sector, industry):
    comment = {'ticker': ticker,
               'name': name,
               'sector' : sector,
               'industry' : industry
               }
    return comment






def get_ticker(row):
    return row.select('td')[1].text.strip()

def get_name(row):
    return row.select('td')[0].text.strip()

def get_sector(row):
    return row.select('td')[2].text.strip()

def get_industry(row):
    return row.select('td')[3].text.strip()




if __name__ == '__main__':
    a = get_nasdaq100()

    print(pd.DataFrame(a))
    print("Finish")


