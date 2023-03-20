/**
 * helper functions defined
 */

function handle_one_return(output) {
    return output;
}
function handle_two_return(output1, output2) {
    return [output1, output2];
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
        }
    );
}


/**
 * 
 * @param {string} url from javascript to flask(python) with route
 * @param {dictionary} data from javascript to flask(python) with data
 * @param {string} dataType The type of data that you're expecting back from the server. (ex. "json")
 * @param {function} handle 큰 의미 없음
 * @returns from flask(python) to javascript with data
 */
function sendAjax_sync(url, data, dataType, handle) {
    /*
        jQuery.ajax(url, [, settings])

        jQuery.getJSON => Asynchronous (비동기식)
        
        Synchronous => 동기식 : 코드 순서대로 진행
    */
    var search_var;
    $.ajax(url=url, settings={data: data, dataType: dataType, async: false,
        success: function(response) {
            search_var = handle(response.result); // handle, 큰 의미 없음
        }
    });
    
    return search_var
}



/**
 * 
 * @param {string} url from javascript to flask(python) with route
 * @param {dictionary} data from javascript to flask(python) with data
 * @param {string} dataType The type of data that you're expecting back from the server. (ex. "json")
 * @param {function} handle 큰 의미 없음
 * @returns from flask(python) to javascript with data
 */
function sendAjax_sync_about_chartData_and_newsArticles(url, data, dataType, handle) {
    /*
        jQuery.ajax(url, [, settings])

        jQuery.getJSON => Asynchronous (비동기식)
        
        Synchronous => 동기식 : 코드 순서대로 진행
    */
    var chart_data;
    var news_articles;
    $.ajax(url=url, settings={data: data, dataType: dataType, async: false,
        success: function(response) {
            [chart_data, news_articles] = handle(response.chart_data, response.news_articles); // handle, 큰 의미 없음
        }
    });
    
    return [chart_data, news_articles];
}

