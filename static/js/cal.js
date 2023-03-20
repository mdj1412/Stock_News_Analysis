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