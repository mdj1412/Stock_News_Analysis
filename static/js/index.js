/* 
    [ jQuery ]
    웹사이트에 자바스크립트를 쉽게 활용할 수 있도록 도와주는 오픈소스 기반의 자바스크립트 라이브러리

    [ 최근 Trends + 비슷한 종류 ]
    1. Lodash
    2. Moment
    3. jQuery
    4. date-fns
    5. RxJS
*/




/*
    ".ready()"는 DOM(Document Object Model)이 완전히 불러와지면 실행되는 Event 이다.

    일반적으로 브라우저가 HTML을 보여주기 위해서는 
    먼저 문서 구조를 만들고 만들어진 문서 구조 위에 디자인을 입히는 형식을 취한다.

    이 과정에서 디자인이 입혀지지 않은 상태로 문서 구조가 만들어진 시점에 시행되는 Event가 ".ready()" 이다.


    jQuery 3.0 버전 이후부터는 "$(handler)" 구문만 권장
    ".read()" Event는 1.8 버전에서는 deprecated 되었으며 3.0에서는 지원하지 않기 때문
    ( 근데 여기서는 실행 문제 잘됨 )
*/






// $(document).ready(function() { });
$(function() {
    var nasdaq_table_container_element = document.getElementById("nasdaq-table-container");
    var chart_container_element = document.getElementById("chart-container");
    var news_container_element = document.getElementById("news-container");
    console.log(nasdaq_table_container_element, chart_container_element, news_container_element);

    
    // nasdaq_table_container_element.style.display = "block";
    // chart_container_element.style.display = "none";
    // news_container_element.style.display = "none";
    // $("#news-container").hide();
    // $("#news-container").show();


    nasdaq_table_init();
});













/**
 * 
 * 
 * 
 * 
 */
function nasdaq_table_init() {
    // HTML 수정
    $("#chart-container").hide();
    $("#news-container").hide();

    // Javascript -> Flask (Python) -> Javascript
    output = sendAjax_sync("/stocks", {}, "json", handle_one_return);

    // console.log("stocksInit() Output : ", output);
    // console.log(typeof output);
    
    // Ticker 길이 확인해보기
    var object_length = Object.keys(output.ticker).length;
    // console.log(object_length);


    // 랜더링 HTML 요소 생성
    stocks = document.querySelector('.stocks');
    stocks.innerHTML = '';

    // "HTML"에 요소 추가
    for (var i = 0; i < object_length; i++) {
        stocks.innerHTML = stocks.innerHTML + '<div class="stock ticker"></div>';
        stocks.innerHTML = stocks.innerHTML + '<div class="stock name">' + output.name[i] + '</div>';
        if (output.diff[i] > 0) {
            stocks.innerHTML = stocks.innerHTML + '<div class="stock diff up">' + '+' + output.diff[i] + ' %' + '</div>';
        }
        else { stocks.innerHTML = stocks.innerHTML + '<div class="stock diff down">' + output.diff[i] + ' %' + '</div>'; }
        stocks.innerHTML = stocks.innerHTML + '<div class="stock open">' + output.open[i] + '</div>';
        stocks.innerHTML = stocks.innerHTML + '<div class="stock close">' + output.close[i] + '</div>';
        stocks.innerHTML = stocks.innerHTML + '<div class="stock sector">' + output.sector[i] + '</div>';
        stocks.innerHTML = stocks.innerHTML + '<div class="stock industry">' + output.industry[i] + '</div>';

        // Add ticker's chart link
        execution_function = String('"javascript:chartInit(\''.concat(output.ticker[i], '\');"'));
        stock = document.querySelectorAll('.stock.ticker')[i];
        stock.innerHTML = '';
        stock.innerHTML = stock.innerHTML + '<a href='.concat(execution_function, '>') + output.ticker[i] + '</a>';
    }
}








/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */
function chartInit(ticker) {
    // HTML 수정
    $("#nasdaq-table-container").hide();
    $("#chart-container").show();
    $("#news-container").hide();

    // ticker 이름 설정 (부제목 설정)
    $('#chart-container .goticker .tickerName').text(ticker.concat(' Chart'));

    // Javascript -> Flask (Python) -> Javascript
    let [chart_data, news_articles] = sendAjax_sync_about_chartData_and_newsArticles("/chart", {"ticker": ticker}, "json", handle_two_return);
    // console.log(chart_data, news_articles);
    // console.log(chart_data);
    // console.log(Object.keys(chart_data.Close));


    // x축과 data 설정
    // data: [{'x': date, 'o': open, 'h': high, 'l': low, 'c': close}, { }, { }, ... ]
    data = [];
    key_list = Object.keys(chart_data.Close);
    for (var i=key_list.length-15; i<key_list.length; i++) {
        key = key_list[i];
        const [year, month, day] = key.split("-");
        const x = new Date(parseInt(year), parseInt(month), parseInt(day), 9, 0, 0, 0).getTime();
        data.push({'x': x, 'o': chart_data.Open[key].toFixed(2), 'h': chart_data.High[key].toFixed(2), 'l': chart_data.Low[key].toFixed(2), 'c': chart_data.Close[key].toFixed(2)})
    }
    // console.log("data : ", data);




    // Javascript chart.js candlestick
    let mychart = document.getElementById('myChart');
    new Chart(mychart, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: 'CHRT - '.concat(ticker),
                data: data
            }]
        }
    });





    //////////////////////////////////////////////////////////////////

    // Javascript를 이용해 HTML에 동적으로 태그 추가

    // a 태그 onclick 적용
    execution_function = String('javascript:chartInit(\''.concat(ticker, '\');'));
    const goTicker = document.querySelector('.goticker');
    goTicker.setAttribute('href', execution_function);

    //////////////////////////////////////////////////////////////////





    //////////////////////////////////////////////////////////////////

    // table title 표시
    // 해당 class의 text 집어넣기
    const table_title = document.querySelector('.table-title');
    $('.table .table-title').text(ticker.concat(' News'));



    news_table = document.querySelector('.table .news-table');
    // console.log(news_table.innerHTML);


    // console.log(news);
    // console.log(Object.keys(news)); // key 배열 만들기
    // console.log(typeof Object.keys(news));




    /* 
        [ 날짜 정렬 ]
        "news"에서 index에 대해서 정렬을 하고 reduce() 함수를 적용.

        reduce() : 배열의 각 요소에 대해 주어진 reducer 함수를 실행하고, 하나의 결과값을 반환
    */
    sorted_news = {}
    sorted_news = Object.keys(news_articles).sort(function (a, b) {
        if (a < b) { return 1; }
        else if (a > b) { return -1; }
        else { return 0; }
    }).reduce((sorted_news, key) => {
        sorted_news[key] = news_articles[key];
        return sorted_news;
    }, {});
    // console.log(sorted_news);

    var key_list = Object.keys(chart_data.Open);
    var open_list = Object.values(chart_data.Open);
    var close_list = Object.values(chart_data.Close);

    for (var i=0; i<key_list.length; i++) {
        const [year, month, day] = key_list[i].split("-");
        key_list[i] = year + '.' + month + '.' + day;
    }
    // console.log(key_list);

    // List 안의 value를 뽑을 때, (Python) => for item in list:
    Object.keys(sorted_news).forEach(key => {
        var idx = key_list.indexOf(String(key));

        if (idx != -1) { var diff = ((open_list[idx]-close_list[idx-1])/(open_list[idx]) * 100.0).toFixed(2); }
        else { var diff = '.'; }

        if (diff == '.') {
            var diff_html = '<th class="news diff">' + diff + '</th>';
        }
        else if (diff > 0) {
            var diff_html = '<th class="news diff up">+' + diff + ' %</th>';
        }
        else {
            var diff_html = '<th class="news diff down">' + diff + ' %</th>';
        }
        var html = '<tr align="center" bgcolor="white"><th>+</th><th>' + key + '</th>' + diff_html + '<td style="text-align: left;">';

        for (var i = 0; i < sorted_news[key].length; i++) {
            var title = sorted_news[key][i].substring(0, sorted_news[key][i].length-4);
            var sendTitle = title; // Javascript -> Python 보내기 위한 title
            console.log("title : ", title);

            
            // title에서 & 표시가 있을 수 있음.
            // Title 에서 '&'로 표시되어 있는데 따로 구별해야 된다.
            // andSymbolInTitle 에서 가져온 '&' 위치 index를 title과 합쳐준다.
            andSymbolInTitle = [];
            let idx = 0;
            // title = "asdf&asdf&AS&DF&&";
            // sendTitle = title;

            while (true) {
                idx = sendTitle.indexOf('&', idx);
                if (idx == -1) { break; }
                sendTitle = sendTitle.substring(0, idx) + sendTitle.substring(idx+1, sendTitle.length);
                // console.log(sendTitle);
                andSymbolInTitle.push(idx + andSymbolInTitle.length);
            }
            // console.log("title : ", title);
            // console.log("sendTitle : ", sendTitle);
            // console.log("andSymbolInTitle : ", andSymbolInTitle);

            var link = String('"/info?ticker='.concat(ticker, '&date=', key, '&title=', sendTitle, '&andSymbolInTitle=', andSymbolInTitle, '"'));
            // console.log(link);
            
            var execution_function = String(`javascript:newsInit(\'${ticker}\',\'${key}\',\'${sendTitle}\',\'${andSymbolInTitle}\');`);
            // console.log("execution_function : ", execution_function);
            html = html + '<a href=' + link + '>' + title + '</a><br>';
        }
        html = html + '</td>';

        news_table.innerHTML = news_table.innerHTML + html;
    });
}









/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */
function newsInit(ticker1, date1, title1, andSymbolInTitle1) {
    console.log("newsInit start");
    // HTML 수정
    $("#nasdaq-table-container").hide();
    $("#chart-container").hide();
    $("#news-container").show();

    spaceIndex_inTitle = andSymbolInTitle1.split(',');
    var list_length = spaceIndex_inTitle.length;
    for (var i=0; i<list_length; i++) {
        title1 = title1.substring(0, i) + ' ' + title1.substring(i, title1.length);
    }

    console.log(ticker1);
    console.log(date1);
    console.log(title1);
    console.log(andSymbolInTitle1);



    //////////////////////////////////////////////////////////////////////
    
    // Javascript를 이용해 HTML에 동적으로 태그 추가



    // a 태그 onclick 적용
    execution_function = String('javascript:chartInit(\''.concat(ticker, '\');'));
    const goTicker = document.querySelector('.goticker');
    goTicker.setAttribute('href', execution_function);


    // a 태그에 URL 적용
    const addURL = document.querySelector('.NewsURL .input-News-URL');
    addURL.setAttribute('href', url);


    // 모델에서 질문 예시 Ticker에 알맞게 작성하기
    const example_value = document.querySelector('#model .text-form #text-input');
    example = "Why did " + ticker + "'s stock go down?";
    example_value.setAttribute('value', example);


    //////////////////////////////////////////////////////////////////////
    // NER 관련

    ents = sendAjax_sync('/ner', {'ticker': ticker, 'date': date, 'title': title}, dataType="json", handle=handle_one_return);
    // ents = {'text': [], 'start_char': [], 'end_char': [], 'label_': [], 'news': []}
    console.log(ents);

    let news = ents['news'];
    let numOfNER = ents['text'].length;


    // 랜더링 html 요소 생성
    news_ner = document.querySelector('.entities');
    news_ner.innerHTML = '';

    for (i=0; i<numOfNER-1; i++) {
        start_idx = (i == 0) ? 0 : ents['end_char'][i-1];
        end_idx = ents['start_char'][i];
        last_idx = ents['end_char'][i];

        label = ents['label_'][i];
        if (label == 'ORG') { class_name = "entity_org"; }
        else if (label == 'PERSON') { class_name = "entity_person"; }
        else if (label == 'FAC') { class_name = "entity_fac"; }
        else if (label == 'GPE') { class_name = "entity_gpe"; }
        else if (label == 'PRODUCT') { class_name = "entity_product"; }
        else { console.log("[ Error !!! - New NER label_ ] : ", ents['label_'][i], ents['text'][i]); class_name = "none"; }

        news_ner.innerHTML = news_ner.innerHTML + news.substring(start_idx, end_idx);
        news_ner.innerHTML = news_ner.innerHTML + '<mark class=' + class_name
            + ' style="line-height: 1;">'
            + news.substring(end_idx, last_idx) 
            + '<span class="show-label" style="font-size: 0.8em; font-weight: bold; line-height: 1; border-radius: 0.35em; vertical-align: middle; margin-left: 0.5rem">'
            + label + '</span></mark>';
    }
    news_ner.innerHTML = news_ner.innerHTML + news.substring(ents['end_char'][numOfNER-1]);
    



    //////////////////////////////////////////////////////////////////////
    // 모델 적용 내용 ( Submit )

    var sendTitle = title; // Javascript -> Python 보내기 위한 title

            
    // title에서 & 표시가 있을 수 있음.
    // Title 에서 '&'로 표시되어 있는데 따로 구별해야 된다.
    // andSymbolInTitle 에서 가져온 '&' 위치 index를 title과 합쳐준다.
    andSymbolInTitle = [];
    let idx = 0;
    // title = "asdf&asdf&AS&DF&&";
    // sendTitle = title;

    while (true) {
        idx = sendTitle.indexOf('&', idx);
        if (idx == -1) { break; }
        sendTitle = sendTitle.substring(0, idx) + sendTitle.substring(idx+1, sendTitle.length);
        console.log(sendTitle);
        andSymbolInTitle.push(idx + andSymbolInTitle.length);
    }

    console.log(andSymbolInTitle);
    console.log("Last String", sendTitle);



    // function 앞에 "async"를 붙이면 해당 함수는 항상 프라미스를 반환한다.
    const translateText = async (text) => {
        // 목적 : Flask에 input을 보내주고 output을 받아오는 과정
        console.log("Start translateText async");

        // "await"는 "async" 함수 안에서만 동작한다.
        // "await" 키워드를 만나면 Promise가 처리될 때까지 기다린다.
        // Promise가 처리되길 기다리는 동안엔 엔진이 다른일(다른 스크립트를 실행, 이벤트 처리 등)을 할 수 있기 때문에, CPU 리소스가 낭비되지 않는다.
        const inferResponse = await fetch(`newsQuestions?ticker=${ticker}&date=${date}&title=${sendTitle}&andSymbolInTitle=${andSymbolInTitle}&questions=${text}`); // Javascript -> Flask(python)
        
        // console.log("inferResponse : ", inferResponse);

        const inferJson = await inferResponse.json(); // Flask(python) -> Javascript

        // console.log(inferJson);
        return inferJson.result['answer'];
    };


    /* 모델 Submit button 관련 내용 */
    // form 태그의 class 이름
    const textForm = document.querySelector('.text-form');


    // addEventListener(type, listener)
    // addEventListener(type, listener, options)
    // addEventListener(type, listener, useCapture)
    textForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        // console.log(event);

        // html -> javascript : input 받아와서 output 보내기
        const textInput = document.getElementById('text-input');
        const textParagraph = document.querySelector('.text-output');

        console.log("textInput : ", textInput, textInput.value);
        try {
            // sendAjax("/inference", {"input_text" : textInput.value}, handleOutput);
            
            // "await"는 "async" 함수 안에서만 동작한다.
            // "await" 키워드를 만나면 Promise가 처리될 때까지 기다린다.
            // Promise가 처리되길 기다리는 동안엔 엔진이 다른일(다른 스크립트를 실행, 이벤트 처리 등)을 할 수 있기 때문에, CPU 리소스가 낭비되지 않는다.
            const answer = await translateText(textInput.value); // Flask에 input을 보내주고 output을 받아오는 과정
            
            console.log("Answer : ", answer);
            textParagraph.textContent = answer;
        } catch (err) {
            console.error(err);
        }
    });
}

