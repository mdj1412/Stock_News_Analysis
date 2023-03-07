import os
from bs4 import BeautifulSoup
import pandas as pd

from flask import Flask, jsonify, request, render_template

import spacy
from spacy import displacy

# 모델을 적용시키는 파일
from modules.inference import Tk_instruct

# Stocks Data
from dataset_creation.nasdaq_data import get_list, get_data


# Flask Object 생성
# __name__은 현재 실행 중인 모듈 이름을 전달하는 것이다.
app = Flask(__name__)


# def stocks() 사용 & News Data
# Pandas DataFrame : ticker, name, sector, industry, diff, open, close, date
demo_dic = get_list()





##### Home #####
@app.route('/')
def home_page():
    example_embed = 'This website analyzes stock market news and provides answers to questions related to news articles.'
    return render_template('index.html', embed=example_embed)# html을 불러올 때,



##### Data fetch #####
@app.route('/submit', methods=['GET', 'POST'])
def submit():
    input_text = request.args.get('input_text')
    return jsonify(result={"output":"My output is a summary of: "+input_text})




@app.route('/model', methods=['GET', 'POST'])
def model():
    print("\t\t Start model !!!")

    # Javascript 에서 받은 메시지
    text_input = request.args.get('text_input')

    print(f"Fetch from Javascript /inference, text_input : {text_input}")

    # modules/reference.py 에서 모델 적용
    output = Tk_instruct(text_input)
    
    text_output = {"text_output": output}
    print(f"Fetch from Javascript /inference, text_output : {text_output}")
    return jsonify(result=text_output)




# Show Ticker's Table
@app.route('/stocks', methods=['GET', 'POST'])
def stocks():
    result = demo_dic.to_dict() # dictionary 형태로 변환
    return jsonify(result=result)









################################################################################################


# {ticker1: [{날짜1: [제목1, 제목2, ...]}, {날짜2: [제목3, 제목4, ...]}, ...], ticker2: [{날짜3: [제목5, 제목6, ...]}, {날짜4: [제목7, 제목8, ...]}, ...], ... }
ticker_dic = dict.fromkeys(demo_dic.ticker, []) # ticker1: [{날짜1: [제목1, 제목2, ...]}



dir = './news'
if not os.path.exists(dir):
    raise NotImplementedError("Not exists News Data")# 오류 강제 발생

# News Data List 가져오기
for key in os.listdir(dir):
    if key not in ticker_dic.keys():
        raise NotImplementedError("Not exists Ticker")# 오류 강제 발생

    dir2 = os.path.join(dir, key)
    ticker_dic[key] = dict.fromkeys(os.listdir(dir2), []) # 날짜1: [제목1, 제목2, ...]

    for date in os.listdir(dir2):
        dir3 = os.path.join(dir2, date)
        title_list = [title for title in os.listdir(dir3)]

        # 해당 날짜에 News가 없을 수도 있음
        if len(title_list) != 0:
            ticker_dic[key][date] = title_list # [제목1, 제목2, ...]
        else:
            ticker_dic[key].pop(date)


# from IPython import embed; embed()



# Show Ticker's Title
@app.route('/<ticker>', methods=['GET', 'POST'])
def ticker(ticker):
    example_embed = "%s Chart" % (ticker)

    return render_template('chart.html', embed=example_embed)


# Show Ticker's Data
@app.route('/chart', methods=['GET', 'POST'])
def chart():
    print("Start /chart ")

    # Javascript 에서 받은 메시지
    ticker = request.args.get('ticker')
    
    # Implement Module
    chart_data = get_data(tickers=[ticker], numOfDay=120)[0]

    # 날짜 형식 바꾸기
    chart_data.index = [k.strftime("%Y-%m-%d") for k in chart_data.index]

    result = chart_data.to_dict()
    return jsonify(result=result)


@app.route('/news', methods=['GET', 'POST'])
def news():
    print("Start /news ")

    # Javascript 에서 받은 메시지
    ticker = request.args.get('ticker')

    news_dir = os.path.join('./news', ticker)

    # 해당 Ticker의 날짜별 뉴스 제목을 가져온다.
    result = {}
    for key in os.listdir(news_dir):
        title_list = os.listdir(os.path.join(news_dir, key))
        if len(title_list) != 0:
            result[key] = os.listdir(os.path.join(news_dir, key))

    # 최근 뉴스부터 보이게 (정렬)
    sorted_result = {}
    for key, value in sorted(result.items(), reverse=True):
        sorted_result[key] = value

    return jsonify(result=sorted_result)
    




################################################################################################

# 1. 기본 url
# 2. 쿼리 스트링이 존재하는 url
#       : request.args.get('변수이름')을 사용하여 /user?변수=값&변수=값&...에서 원하는 변수의 값을 얻을 수 있다.
# 3. clean URL



# Show Ticker's Title and News's Title
@app.route('/info', methods=['GET', 'POST'])
def ticker_title():
    print("app.py : /info Start ")

    # Javascript 에서 받은 메시지
    ticker = request.args.get('ticker')
    date = request.args.get('date')
    title = request.args.get('title')
    andSymbolInTitle = request.args.get('andSymbolInTitle')


    # Title 에서 '&'로 표시되어 있는데 따로 구별해야 된다.
    # andSymbolInTitle 에서 가져온 '&' 위치 index를 title과 합쳐준다.
    if andSymbolInTitle != '':
        andSymbolInTitle = andSymbolInTitle.split(',')
        for i in range(len(andSymbolInTitle)): # String -> int
            andSymbolInTitle[i] = int(andSymbolInTitle[i])
        for idx in andSymbolInTitle:
            title = title[0:idx] + '&' + title[idx:len(title)]



    # 해당 Ticker, Date, Title의 URL을 가져오기
    url_dir = "dataset_creation/save_news_url.tsv"

    if not os.path.exists(url_dir):
        raise NotImplementedError("Not exists {} directory", url_dir)
    else:
        df = pd.read_csv(url_dir, sep='\t', index_col=0)
    
    filt = (df['ticker'] == ticker) & (df['date'] == date) & (df['title'] == title)
    url = list(df.loc[filt, 'url'].values)

    if len(url) != 1:
        from IPython import embed; embed()
        raise NotImplementedError("There exists many URL or empty")
    else:
        url = url[0]

    example_embed1 = ticker
    example_embed2 = "Date: %s" % (date)
    example_embed3 = "Title: %s" % (title)
    example_embed4 = url


    return render_template('news_analysis.html', embed1=example_embed1, embed2=example_embed2, embed3=example_embed3, embed4=example_embed4)






@app.route('/ner', methods=['GET', 'POST'])
def ner():
    print("Start /ner")

    # Javascript 에서 받은 메시지
    ticker = request.args.get('ticker')
    date = request.args.get('date')
    title = request.args.get('title')

    print(ticker, date, title)

    # 뉴스 데이터 위치 찾기 ( in directory )
    dir = os.path.join('./news', ticker, date, title+'.txt')

    f = open(dir, 'r')
    news_data = f.read()



    # NER
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(news_data) # News Data Analysis


    # 필요없는 용어들 버리기
    print("=====================================================================")

    ents = {'text': [], 'start_char': [], 'end_char': [], 'label_': []}
    for ent in doc.ents:
        # print(ent.text, ent.start_char, ent.end_char, ent.label_)

        # 버리는 용어들
        if ent.label_ == 'DATE':
            continue
        if ent.label_ == 'TIME':
            continue
        if ent.label_ == 'CARDINAL':
            continue
        if ent.label_ == 'MONEY':
            continue
        if ent.label_ == 'PERCENT':
            continue
        if ent.label_ == 'ORDINAL':
            continue
            

        print(ent.text, ent.start_char, ent.end_char, ent.label_)

        ents['text'].append(ent.text)
        ents['start_char'].append(ent.start_char)
        ents['end_char'].append(ent.end_char)
        ents['label_'].append(ent.label_)

    print("=====================================================================")

    ents['news'] = news_data

    # ents = {'text': [], 'start_char': [], 'end_char': [], 'label_': [], 'news': []}
    return jsonify(result=ents)






@app.route('/newsQuestions', methods=['GET', 'POST'])
def newsQuestions():
    # Javascript 에서 받은 메시지
    ticker = request.args.get('ticker')
    date = request.args.get('date')
    title = request.args.get('title')
    andSymbolInTitle = request.args.get('andSymbolInTitle')
    questions = request.args.get('questions')



    # Title 에서 '&'로 표시되어 있는데 따로 구별해야 된다.
    # andSymbolInTitle 에서 가져온 '&' 위치 index를 title과 합쳐준다.
    if andSymbolInTitle != '':
        andSymbolInTitle = andSymbolInTitle.split(',')
        for i in range(len(andSymbolInTitle)): # String -> int
            andSymbolInTitle[i] = int(andSymbolInTitle[i])
        for idx in andSymbolInTitle:
            title = title[0:idx] + '&' + title[idx:len(title)]



    # 뉴스 데이터 위치 찾기 ( in directory )
    dir = os.path.join('./news', ticker, date, title+'.txt')

    # 뉴슫 데이터 가져오기
    f = open(dir, 'r')
    text = f.read()
    f.close()

    # 모델 적용
    answer = Tk_instruct(text, questions)

    result = {}
    result['answer'] = answer

    return jsonify(result=result)



# Terminal : Flask : 수정하면 터미널 재실행
# Elements : HTML : 수정하면 터미널 재실행
# Console : javascript : 사이트 동기화
# Sources : File : 사이트 동기화
# CSS : 사이트 동기화



if __name__ == "__main__":
    # run app
    # host : 모든 IP에 대해 접근 허용, ( Default. localhost = 127.0.0.1 )
    # port : 접속시 open될 http port, ( Default. port = 5000 )
    app.run(host='0.0.0.0', port='7860') #http://0.0.0.0:5001
    # app.run(debug=True) #http://0.0.0.0:5001