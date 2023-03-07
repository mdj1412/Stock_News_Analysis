// jQuery
// $(document).ready(function() { });
$(function() {
    console.log("Start News's Title !");
    newsInit();
});





function newsInit() {
    // Ticker 이름 가져오기
    // 해당 class의 text 가져오기
    let ticker = document.querySelector('.goticker .tickerName').textContent;
    let date = document.querySelector('.titleDate').textContent;
    let title = document.querySelector('.titleName').textContent;
    let url = document.querySelector('.NewsURL').textContent;

    ticker = ticker;
    date = date.substring(6, date.length);
    title = title.substring(7, title.length);
    url = url.substring(5, url.length);

    console.log(ticker);
    console.log(date);
    console.log(title);
    console.log(url);


    //////////////////////////////////////////////////////////////////////
    
    // Javascript를 이용해 HTML에 동적으로 태그 추가



    // a 태그 onclick 적용
    const goticker = document.querySelector('.goticker');
    let stockURL = '/'.concat(ticker);
    goticker.setAttribute('href', stockURL);


    // a 태그에 URL 적용
    const addURL = document.querySelector('.NewsURL .input-News-URL');
    addURL.setAttribute('href', url);


    // 모델에서 질문 예시 Ticker에 알맞게 작성하기
    const example_value = document.querySelector('#model .text-form #text-input');
    example = "Why did " + ticker + "'s stock go down?";
    example_value.setAttribute('value', example);


    //////////////////////////////////////////////////////////////////////
    // NER 관련

    ents = sendAjax_async('/ner', {'ticker': ticker, 'date': date, 'title': title}, dataType="json", handle=handleReturn);
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
            + ' style="margin: 0 0.25em; line-height: 1;">'
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














/**
 * 
 * @param {string} url from javascript to flask(python) with route
 * @param {dictionary} data from javascript to flask(python) with data
 * @param {function} handle 큰 의미 없음
 */
function sendAjax(url, data, handle) {
    /*
        jQuery.getJSON(url, [, data], [, success])

        Load JSON-encoded data from the server using a GET HTTP request.
    */

    $.getJSON(url, data, 
        function(response) {
            handle(response.result);
        });
}


/**
 * 
 * @param {string} url from javascript to flask(python) with route
 * @param {dictionary} data from javascript to flask(python) with data
 * @param {string} dataType The type of data that you're expecting back from the server. (ex. "json")
 * @param {function} handle 큰 의미 없음
 * @returns from flask(python) to javascript with data
 */
function sendAjax_async(url, data, dataType, handle) {
    /*
        jQuery.ajax(url, [, settings])

        jQuery.getJSON => Asynchronous (비동기식)
        
        Synchronous => 동기식 : 코드 순서대로 진행
    */

    var search_var;
    console.log("Internal : sendAjax async");

    $.ajax(url=url, settings={data: data, dataType: dataType, async: false,
        success: function(response) {
            console.log("Success : ", typeof response);
            search_var = handle(response.result); // handle, 큰 의미 없음
        }
    });
    
    return search_var
}
