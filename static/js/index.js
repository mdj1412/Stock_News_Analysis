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
    console.log("Start debug !!");
    
    stocksInit();
    // calendarInit();
});





function handleReturn(output) {
    return output;
}



function stocksInit() {
    // Javascript -> Flask (Python) -> Javascript
    output = sendAjax_async("/stocks", {}, "json", handleReturn);

    console.log("stocksInit() Output : ", output);
    console.log(typeof output);
    
    // Ticker 길이 확인해보기
    var object_length = Object.keys(output.ticker).length;
    console.log(object_length);


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
        link = String('"/'.concat(output.ticker[i], '"'));
        stock = document.querySelectorAll('.stock.ticker')[i];
        stock.innerHTML = '';
        stock.innerHTML = stock.innerHTML + '<a href='.concat(link, '>') + output.ticker[i] + '</a>';
    }
}






/**
 * 달력 렌더링 할 때 필요한 정보 목록

    현재 월 (초기값 : 현재 시간)
    금월 마지막일 날짜와 요일
    전월 마지막일 날짜와 요일
 */
function calendarInit() {

    // 날짜 정보 가져오기
    var date = new Date(); // 현재 날짜(로컬 기준) 가져오기
    var utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000); // utc 표준시 도출
    var kstGap = 9 * 60 * 60 * 100; // 한국 kst 기준시간 더하기
    var today = new Date(utc + kstGap); // 한국 시간으로 date 객체 만들기(오늘)

    console.log("Today : ", today)

    // 달력에서 표기하는 날짜 객체
    var thisMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    var currentYear = thisMonth.getFullYear(); // 달력에서 표기하는 연
    var currentMonth = thisMonth.getMonth(); // 달력에서 표기하는 월
    var currentDate = thisMonth.getDate(); // 달력에서 표기하는 일

    // kst 기준 현재시간
    console.log("thisMonth");
    console.log(currentYear);
    console.log(currentMonth); // monthIndex
    console.log(currentDate);
    console.log(thisMonth);

    // 캘린더 랜더링
    renderCalender(thisMonth);


    ////////////////////////////////////////////////////////////////

    function renderCalender(thisMonth, help=0) {

        // 랜더링을 위한 데이터 정리
        currentYear = thisMonth.getFullYear();
        currentMonth = thisMonth = thisMonth.getMonth();
        if (help != 1) {
            // currentDate = thisMonth.getDate(); // 1 - 31 : 1 - 31
            currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getDate();
        }

        // 이전 달의 마지막날 날짜와 요일 구하기
        var startDay = new Date(currentYear, currentMonth, 0);
        var prevDate = startDay.getDate(); // 1 - 31 : 1 - 31
        var prevDay = startDay.getDay(); // Sunday - Saturday : 0 - 6

        // 이번 달의 마지막날 날짜와 요일 구하기
        var endDay = new Date(currentYear, currentMonth + 1 , 0);
        var nextDate = endDay.getDate(); // 1 - 31 : 1 - 31
        var nextDay = endDay.getDay(); // Sunday - Saturday : 0 - 6

        // console.log(prevDate, prevDay, nextDate, nextDay, currentMonth);

        // 현재 월 표기
        $('.year-month').text(currentYear + '.' + (currentMonth + 1));

        // 랜더링 html 요소 생성
        calendar = document.querySelector('.dates')
        calendar.innerHTML = '';

        // 지난달
        for (var i = prevDate - prevDay + 1; i <= prevDate; i++) {
            calendar.innerHTML = calendar.innerHTML + '<div class="day prev disable">' + i + '</div>'
        }

        // 이번달
        for (var i = 1; i <= nextDate; i++) {
            calendar.innerHTML = calendar.innerHTML + '<div class="day current">' + i + '</div>'
        }

        // 다음달
        for (var i = 1; i <= (7 - nextDay == 7 ? 0 : 7 - nextDay); i++) {
            calendar.innerHTML = calendar.innerHTML + '<div class="day next disable">' + i + '</div>'
        }

        // 오늘 날짜 표기
        if (today.getMonth() == currentMonth) {
            todayDate = today.getDate();
            var currentMonthDate = document.querySelectorAll('.dates .current'); // 중간 띄어쓰기 주의
            // var currentMonthDate = document.querySelectorAll('div.day.current'); // 같은 의미

            // console.log(currentMonthDate)
            currentMonthDate[todayDate-1].classList.add('today');
        }

        // 이전달로 이동
        $('.go-prev').on('click', function() {
            if (help == 0) {
                thisMonth = new Date(currentYear, currentMonth - 1, 1);
                renderCalender(thisMonth, 1);
            }
            else {
                renderCalender(thisMonth, 1);
            }
        })

        // 다음달로 이동
        $('.go-next').on('click', function() {
            if (help == 0) {
                thisMonth = new Date(currentYear, currentMonth + 1, 1);
                renderCalender(thisMonth, 1);
            }
            else {
                renderCalender(thisMonth, 1);
            }
        })
    }
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
