
// jQuery
// $(document).ready(function() { });
$(function() {
    chartInit();
});



function chartInit() {
    // Ticker 이름 가져오기
    // 해당 class의 text 가져오기
    let ticker = document.querySelector('.tickerName').textContent;
    // console.log(ticker.indexOf(' '));
    idx = ticker.indexOf(' ');
    ticker = ticker.substring(0, idx);


    // Javascript -> Flask (Python) -> Javascript
    chart_data = sendAjax_sync("/chart", {"ticker": ticker}, "json", handle_one_return);
    console.log(chart_data);
    console.log(Object.keys(chart_data.Close));


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
    console.log("data : ", data);




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
    const goTicker = document.querySelector('.goticker');
    let goTickerURL = '/'.concat(ticker)
    goTicker.setAttribute('href', goTickerURL);

    //////////////////////////////////////////////////////////////////





    //////////////////////////////////////////////////////////////////

    // table title 표시
    // 해당 class의 text 집어넣기
    const table_title = document.querySelector('.table-title');
    $('.table .table-title').text(ticker.concat(' News'));




    // Javascript -> Flask (Python) -> Javascript
    news = sendAjax_sync(url="/news", data={"ticker": ticker}, dataType="json", handle=handle_one_return);

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
    sorted_news = Object.keys(news).sort(function (a, b) {
        if (a < b) { return 1; }
        else if (a > b) { return -1; }
        else { return 0; }
    }).reduce((sorted_news, key) => {
        sorted_news[key] = news[key];
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
    console.log(key_list);

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

            var link = String('"/info?ticker='.concat(ticker, '&date=', key, '&title=', sendTitle, '&andSymbolInTitle=', andSymbolInTitle, '"'));
            // console.log(link);
            html = html + '<a href=' + link + '>' + title + '</a><br>';
        }
        html = html + '</td>';

        news_table.innerHTML = news_table.innerHTML + html;
    });
}