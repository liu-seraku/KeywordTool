$(function () {

    $('*[data-toggle="tooltip"]').tooltip();

    var urlParams = new URLSearchParams(location.search);
    var keywordVal = urlParams.get('keyword');
    var keyword = new Array();
    //if first word is #, need to be deleted  
    $(".selected").text(keywordVal);
    $(".NHK-keyword").val(keywordVal);
    keyword.push(keywordVal);
    var endDate = new Date();
    var endDateISO = endDate.toISOString();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    var startDateISO = startDate.toISOString();
    startDateISO = startDateISO.slice(0, 10);
    endDateISO = endDateISO.slice(0, 10);
    $(".start-date").val(startDateISO);
    $(".end-date").val(endDateISO);
    var myChart;

    var firstInputElm = $("input.keyword")[0];
    $(firstInputElm).val(keyword);
    initialRelatedKwd();

    function openNav() {
        document.getElementById("mySidebar").style.width = "13%";
        document.getElementById("main").style.marginLeft = "13%";
        $(this).hide();
        $(".left").show();
    }

    function closeNav() {
        document.getElementById("mySidebar").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
        $(this).hide();
        $(".right").show();
    }

    function activeSpan(dom) {

        $("span.tpc").removeClass("active");
        $(dom).addClass("active");
        var textVal = $(dom).text();
        $(".selected").text(textVal);
        $(".NHK-keyword").val(textVal);

        var keyword = $(".topic-label").text();
        var btnText = $(".dropbtn").text();
        if (btnText == " Google") {
            $(".searching-btn").attr("href", "https://www.google.co.jp/search?q=" + keyword + " " + textVal);
        } else if (btnText == " Twitter") {
            $(".searching-btn").attr("href", "https://twitter.com/search?q=" + keyword + " " + textVal);
        } else if (btnText == " Facebook") {
            $(".searching-btn").attr("href", "https://www.facebook.com/search/top/?q=" + keyword + " " + textVal);
        } else if (btnText == " YAHOO!テレビ") {
            $(".searching-btn").attr("href", "https://tv.yahoo.co.jp/search/?q=" + keyword + " " + textVal);
        }
    }

    function drawGraph(keyword, jsonObj) {
        var ctx = document.getElementById("canvas");
        var labels = new Array();
        var titles = jsonObj.default.timelineData;
        for (let index = 0; index < titles.length; index++) {
            var title = titles[index].formattedAxisTime;
            labels.push(title);
        }
        var lineNum = keyword.length;
        var borderColors = ['rgba(0, 123, 255, 1)', 'rgba(253, 92, 153, 1)', 'rgba(92, 253, 232, 1)', 'rgba(49, 250, 58, 1)', 'rgba(250, 229, 49, 1)'];
        var datasets = new Array();
        for (let index = 0; index < lineNum; index++) {
            var number = index;
            var data = new Array();
            for (let index = 0; index < titles.length; index++) {
                if (keyword.length == 1) {
                    var formattedValue = titles[index].formattedValue;
                    data.push(formattedValue);
                } else {
                    var formattedValue = titles[index].formattedValue[number];
                    data.push(formattedValue);
                }

            }
            var dataset = {
                label: keyword[number],
                data: data,
                borderColor: borderColors[number],
                borderWidth: 2
            };
            datasets.push(dataset);
        }

        if (myChart) {
            myChart.data = {
                labels: labels,
                datasets: datasets
            };
            myChart.update();
        } else {
            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }

    }

    function interestOverTime(keyword) {
        var keyword = keyword;
        var startTime = $(".start-date").val();
        var endTime = $(".end-date").val();
        const xhr = new XMLHttpRequest();
        const url = '/interestOverTime/' + keyword + '?' + 'geo=' + 'JP' + '&' + 'startTime=' + startTime + '&' + 'endTime=' + endTime;
        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                drawGraph(keyword, xhr.response);
            }
        };
        xhr.open('GET', url);
        xhr.send();
    }

    function relatedTopics(keyword) {
        var keyword = keyword;
        $(".topic-label").text(keyword);
        $(".tpcs").empty();
        $(".hit-tpcs").empty();
        var startTime = $(".start-date").val();
        var endTime = $(".end-date").val();
        const xhr = new XMLHttpRequest();
        const url = '/relatedTopics/' + keyword + '?' + 'geo=' + 'JP' + '&' + 'startTime=' + startTime + '&' + 'endTime=' + endTime;
        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                for (let index = 0; index < 15; index++) {
                    if (xhr.response.default.rankedList[0].rankedKeyword[index]) {
                        const topic = xhr.response.default.rankedList[0].rankedKeyword[index].topic.title;
                        var topicDom = $("<span class=\"tpc\"></span>").text(topic);
                        $(".tpcs").append(topicDom);
                    }

                }
                var hitTopics = xhr.response.default.rankedList[1].rankedKeyword;
                for (let index = 0; index < hitTopics.length; index++) {
                    var topicTitle = hitTopics[index].topic.title;
                    var hitStatus = hitTopics[index].formattedValue;
                    var topicSpan = $("<span class=\"tpc\"></span>").text(topicTitle);
                    var hitSpan = $("<span class=\"hit\"></span>").text(hitStatus);
                    var liElement = $("<li></li>").append(topicSpan).append(hitSpan);
                    $('.hit-tpcs').append(liElement);
                }
                $(".topics span.tpc").click(function () {
                    activeSpan(this);
                });
            }
        };
        xhr.open('GET', url);
        xhr.send();
    }

    function initialRelatedKwd() {
        relatedTopics(keyword);
    }

    function addKeyPanel() {
        var hiddenKeyEle = $(".keyword-panel.option")[0];
        $(hiddenKeyEle).removeClass("option");
    }

    function generateTbody() {
        for (let index = 0; index < 8; index++) {
            var targetDay = new Date();
            targetDay.setDate(targetDay.getDate() + index);
            targetDayStr = targetDay.toISOString();
            targetDayStr = targetDayStr.slice(0, 10);
            var service = $(".NHK-service").val();
            const xhr = new XMLHttpRequest();
            const url = "https://api.nhk.or.jp/v2/pg/list/130/" + service + "/" + targetDayStr + ".json?key=PyID7ZVHHUOwBjmIDmaAONeOMBzzAABf";
            xhr.responseType = 'json';
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    console.log(xhr.response);
                    var showList = xhr.response.list[service];
                    var tableList = new Array();
                    var keyword = $(".NHK-keyword").val();
                    for (let index = 0; index < showList.length; index++) {
                        var information = showList[index].act + showList[index].content + showList[index].subtitle + showList[index].title;
                        var foundShow = information.indexOf(keyword);
                        if (foundShow !== -1) {
                            tableList.push(showList[index]);
                        }
                    }
                    if (tableList.length !== 0) {
                        for (let index = 0; index < tableList.length; index++) {
                            var showTr = $("<tr class=\"NHK-result\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"番組の詳細を表示・非表示\"></tr>");
                            var showTime = tableList[index].start_time;
                            var showEndTime = tableList[index].end_time;
                            var showDay = showTime.slice(0, 10);
                            var showStart = showTime.slice(11, 16);
                            var showEnd = showEndTime.slice(11, 16);
                            var showTitle = tableList[index].title;

                            var showDayTd = $("<td></td>").text(showDay);
                            var showStartTd = $("<td></td>").text(showStart);
                            var showEndTd = $("<td></td>").text(showEnd);
                            var showTitleTd = $("<td class=\"show-title\"></td>").text(showTitle);

                            showTr.append(showDayTd).append(showStartTd).append(showEndTd).append(showTitleTd);
                            $(".NHK-tbody").append(showTr);
                            $('*[data-toggle="tooltip"]').tooltip();

                            var showDetail = $("<tr class=\"show-detail\"></tr>");
                            var detailTd = $("<td colspan=\"4\"></td>");
                            var subtitleTDiv = $("<div style=\"margin: 1rem; font-weight: bolder;\">サブタイトル</div>");
                            var subtitleDDiv = $("<div style=\"margin: 1rem;\"></div>").text(tableList[index].subtitle);
                            var contentTDiv = $("<div style=\"margin: 1rem; font-weight: bolder;\">コンテンツ</div>");
                            var contentDDiv = $("<div style=\"margin: 1rem;\"></div>").text(tableList[index].content);
                            var actTDiv = $("<div style=\"margin: 1rem; font-weight: bolder;\">出演者</div>");
                            var actDDiv = $("<div style=\"margin: 1rem;\"></div>").text(tableList[index].act);
                            detailTd.append(subtitleTDiv).append(subtitleDDiv).append(contentTDiv).append(contentDDiv).append(actTDiv).append(actDDiv);
                            showDetail.append(detailTd);
                            $(".NHK-tbody").append(showDetail);

                            showTr.click(function(){
                                $(this).next().toggle();
                            });

                        }
                    } else {
                        var showTr = $("<tr></tr>");
                        var showTd = $("<td colspan=\"4\">該当番組はありません</td>");
                        showTr.append(showTd);
                        $(".NHK-tbody").append(showTr);
                    }
                }
            };
            xhr.open('GET', url);
            xhr.send();
        }
    }

    $(".right").click(openNav);
    $(".left").click(closeNav);
    $(".related-btn").click(function () {
        var topic = $(this).prev().val();
        relatedTopics(topic);
    });
    $(".add-key-btn").click(function () {
        var hiddenKeyNum = $(".keyword-panel.option").length;
        if (hiddenKeyNum == 1) {
            $(this).hide();
        }
        addKeyPanel();
    });
    $(".delete-btn").click(function () {
        var hiddenKeyNum = $(".keyword-panel.option").length;
        if (hiddenKeyNum == 0) {
            $(".add-key-btn").show();
        }
        $(this).prev().prev().val("");
        $(this).parent().addClass("option");
    });
    $(".start-analyze").click(function () {
        window.location = "#canvas";
        var keywords = new Array();
        var keywordsEle = $("input.keyword");
        for (let index = 0; index < keywordsEle.length; index++) {
            const element = keywordsEle[index];
            var oneKeyword = $(element).val();
            if (oneKeyword) {
                keywords.push(oneKeyword);
            }
        }
        interestOverTime(keywords);
    });

    /* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
    function myFunction() {
        document.getElementById("myDropdown").classList.toggle("show");
    }

    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function (event) {
        if (!event.target.matches('.dropbtn')) {

            var dropdowns = document.getElementsByClassName("dropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }

    $(".dropbtn").click(myFunction);

    $(".dropdown-content div").click(function () {
        var textVal = $(this).text();
        var keyword = $(".topic-label").text();
        var relatedKeyword = $(".selected").text();
        if (textVal == " Google") {
            $(".searching-btn").attr("href", "https://www.google.co.jp/search?q=" + keyword + " " + relatedKeyword);
        } else if (textVal == " Twitter") {
            $(".searching-btn").attr("href", "https://twitter.com/search?q=" + keyword + " " + relatedKeyword);
        } else if (textVal == " Facebook") {
            $(".searching-btn").attr("href", "https://www.facebook.com/search/top/?q=" + keyword + " " + relatedKeyword);
        } else if (textVal == " YAHOO!テレビ") {
            $(".searching-btn").attr("href", "https://tv.yahoo.co.jp/search/?q=" + keyword + " " + relatedKeyword);
        }
        var buttons = $(".dropdown-content div");
        for (let index = 0; index < buttons.length; index++) {
            const element = buttons[index];
            $(element).removeClass("hidden-option");
        }
        $(this).addClass("hidden-option");
        $(".dropbtn").text(textVal);
    });

    $(".NHK-btn").click(function () {
        $(".NHK-tbody").empty();
        generateTbody();
    });

});