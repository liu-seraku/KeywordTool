$(function () {

    var urlParams = new URLSearchParams(location.search);
    var divOpen = urlParams.get('div');
    if (divOpen=="first-div") {
        $(".first-div").fadeIn();
    } else if (divOpen=="second-div") {
        $(".second-div").fadeIn();
    } else if (divOpen=="third-div") {
        $(".third-div").fadeIn();
    } else if (divOpen=="forth-div") {
        $(".forth-div").fadeIn();
    } else {
        $(".first-div").fadeIn();
    }

    

    const xhr = new XMLHttpRequest();
    const url = "/getTrendKeywords";
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            var dataList = xhr.response[0].trends;
            for (let index = 0; index < dataList.length; index++) {
                const topic = dataList[index].name;
                var topicDom = $("<span></span>").text(topic);
                var topicPortal = $("<span></span>").text(topic);
                $(".topics").append(topicDom);
                $(".keywords").append(topicPortal);
            }
            $(".topics span").click(function () {
                $(".topics span").removeClass("active");
                $(this).addClass("active");
                var value = $(this).text();
                value = value.replace("#", "");
                $(".input-panel input[type=\"text\"]").val(value);
            });
            $(".keywords span").click(function () {
                $(".keywords span").removeClass("active");
                $(this).addClass("active");
                var value = $(this).text();
                value = value.replace("#", "");
                $(".portal-selected").val(value);
                var link = $(".portal-web-sites").val();
                $(".portal-sites-btn").attr("href", link + value);
            });
        }
    };
    xhr.open('GET', url);
    xhr.send();

    $(".links span").click(function () {
        $(".links span").removeClass("active");
        $(this).addClass("active");
        var id = $(this).attr("id");
        $(".main > div").hide();
        $("div." + id).fadeIn();
    });

    $(".input-panel input").blur(function () {
        $(".topics span").removeClass("active");
    });

    $(".portal-selected").blur(function(){
        var link = $(".portal-web-sites").val();
        var keyword = $(this).val();
        $(".portal-sites-btn").attr("href", link + keyword);
    });

    $(".portal-web-sites").click(function(){
        console.log($(this).val());
        var link = $(this).val();
        var keyword = $(".portal-selected").val();
        $(".portal-sites-btn").attr("href", link + keyword);
    });

});