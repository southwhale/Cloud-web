CloudWeather=$.NameSpace.register('CloudWeather');
$(".CloudWeatherHead div button")[0].onclick=function () {
    if($("#CloudWeatherChangCity")[0]){
        return false;
    }
    else {
        $.Confirm({
            id: 'CloudWeatherChangCity',
            node: $(".CloudWeather")[0],
            title: '切换城市',
            notic: '输入要查看的城市',
            submit_func: CloudWeather.postCity,
            confirm_input: 'CityName',
            confirm_input_val: $.Cookie.get('city')
        });
    }
};
CloudWeather.postCity=function () {
    var cityname=$("#CityName")[0].value;
    if(cityname===''){
        $.Toast('请输入城市名');
    }
    else if(cityname===$.Cookie.get('city')){
        $.Toast('当前为所查询的城市');
        $("#CityName")[0].value='';
    }
    else{
        $.Cookie.set('city',cityname,(1440 * 60 * 1000));
        CloudWeather.GetWeather(cityname);
        CloudMain.Weather.start();
    }
};
CloudWeather.GetWeather=function(cityname) {
    if(cityname===''||cityname===null){
        cityname='深圳';
    }
    CloudMain.Ajax({
        url:"/service/WeatherInfo",
        data: {
            city: cityname
        },
        success: function (rs) {
            if(rs.error===0) {
                CloudWeather.ShowData(rs.results[0]);
                if($("#CloudWeatherChangCity")[0]) {
                    $.Window.Close($("#CloudWeatherChangCity")[0]);
                }
            }
            else if(rs.error===-3){
                $.Toast('所查询的城市：'+cityname+'不存在');
                $.Cookie.set('city','深圳',(1440 * 60 * 1000));
                CloudWeather.GetWeather('深圳');
                if($("#CityName")[0]){
                    $("#CityName")[0].value='';
                }
            }
        }
    });
};
CloudWeather.ShowData=function (data) {
    $(".CloudWeatherLoading")[0].style.display='none';
    var CWeatherCity=$(".CWeatherCity")[0];
    var CWeatherTImg=$("#CWeatherTImg")[0];
    var CweatherTInfo=$("#CWeatherTInfo")[0];
    var CWeatherList=$(".CWeatherList")[0];
    var CWeatherNumber=$(".CWeatherNumber")[0];
    var CWeatherTtemperature=$("#CWeatherTtemperature li");
    var hour = new Date().getHours();
    var Weather_flag='day';
    var todayState=$.String.before(data.weather_data[0].nightPictureUrl,'\/').split('.')[0];
    var realData=data.weather_data[0].date;
    var pm25=data.pm25;
    if(hour>=18){
        Weather_flag='night';
    }
    else{
        Weather_flag='day';
    }
    CWeatherTImg.src='./public/img/weather/'+Weather_flag+'/'+todayState+'.png';
    if (/\：/.test(realData)) {
        realtext = realData.slice(realData.lastIndexOf('(') + 4, realData.lastIndexOf(')')-1) + '°';
        CweatherTInfo.innerHTML = realtext;
    } else {
        CweatherTInfo.innerHTML = '*';
    }
    CWeatherTtemperature[0].innerHTML=data.weather_data[0].temperature;
    CWeatherTtemperature[1].innerHTML=data.weather_data[0].weather;
    CWeatherTtemperature[2].innerHTML=data.weather_data[0].wind;
    CWeatherNumber.innerHTML=CWeatherList.innerHTML='';
    CWeatherCity.innerHTML='当前城市：'+data.currentCity;
    $.Cookie.set('city',data.currentCity,315360000000);
    for(var i=0;i<data.weather_data.length;i++){
        var a=$.CreateElement({
            tag:"li",
            style:{"animation-delay":'0.'+(i+2)+"s"},
            node:CWeatherList
        });
        var b=$.CreateElement({
            className:'CWeacherCenter',
            node:a
        });
        $.CreateElement({
            tag:'img',
            attr:{"draggable":"false","src":'./public/img/weather/'+Weather_flag+'/'+$.String.before(data.weather_data[i].nightPictureUrl,'\/').split('.')[0]+'.png'},
            node:b
        });
        $.CreateElement({
            tag:'p',
            html:data.weather_data[i].date,
            node:a
        });
        $.CreateElement({
            tag:'p',
            html:data.weather_data[i].temperature,
            node:a
        });
        $.CreateElement({
            tag:'p',
            html:data.weather_data[i].weather,
            node:a
        });
        $.CreateElement({
            tag:'p',
            html:data.weather_data[i].wind,
            node:a
        });
    }
    var zs=data.index;
    for (i = 0; i <zs.length; i++) {
        (function (i) {
            var a=$.CreateElement({
                className:'CWeatherNumberCon',
                style:{"animation-delay":'0.'+(i+2)+"s"},
                node:CWeatherNumber
            });
            var b=$.CreateElement({
                tag:"span",
                html:'<span>'+zs[i].zs+'</span>',
                className:'fa fa-angle-down',
                node:$.CreateElement({
                    tag:"p",
                    html:zs[i].tipt,
                    node:a
                })
            });
            var c=$.CreateElement({
                className:'CWeatherNumberTips',
                html:zs[i].des,
                node:a
            });
            a.onclick=function () {
                var aa=$(".CWeatherNumberCon");
                for (var j = 0; j<aa.length; j++) {
                    aa[j].getElementsByTagName('span')[0].className='fa fa-angle-down';
                    aa[j].getElementsByTagName('div')[0].style.display='none';
                }
                if(b.className==='fa fa-angle-down'){
                    b.className='fa fa-angle-up';
                    c.style.display='block'
                }else {
                    b.className='fa fa-angle-down';
                    c.style.display='none';
                }
            }
        })(i)
    }
    var aa=$(".CWeatherNumberCon");
    aa[0].getElementsByTagName('span')[0].className='fa fa-angle-up';
    aa[0].getElementsByTagName('div')[0].style.display='block';
    function CWeatherCandler(dateString) {
        var date = [],
            nonleap = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            leap = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            year, month, theDate;
        year = dateString.slice(0, dateString.indexOf('-'));
        month = dateString.slice(dateString.indexOf('-') + 1, dateString.lastIndexOf('-'));
        theDate = dateString.slice(dateString.lastIndexOf('-') + 1);
        if (year%400 === 0||year%4===0&&year%100!=0) {
            var monthNum = leap[Number(month)];
        } else {
            var monthNum = nonleap[Number(month)];
        }
        for (var i = 0; i < 4; i++) {
            date[i] = [];
            date[i][0] = Number(month);
            date[i][1] = theDate++;
            if (date[i][1] > monthNum) {
                if (++month > 12) {
                    month = 1;
                    date[i][0] = month;
                } else {
                    date[i][0] = month;
                }
                theDate = 1;
                date[i][1] = theDate++;
            }
        }
        return date;
    }
    !function ShowPm25() {
        var canvas = $("#CWeatherPM")[0];
        var box = {
                width: canvas.width,
                height: canvas.height
            }, radius = 100,
            beginAngle = -Math.PI / 2 - Math.PI * 6 / 7,
            begin = beginAngle,
            finish,
            increment = 0,
            strokeStyle,
            imageData;
        var ctx = canvas.getContext('2d');
        function animation() {
            ctx.putImageData(imageData, 0, 0);
            ctx.save();
            ctx.beginPath();
            ctx.translate(box.width / 2, box.height / 2);
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 12;
            ctx.arc(0, 0, radius, beginAngle, begin, false);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
            begin += increment;
            if (beginAngle - (beginAngle - finish) / 2 > begin) {
                increment += 0.003;
            } else {
                increment -= 0.0028;
            }
            if (increment < 0) {
                increment = -increment;
            }
            if (begin < finish) {
                window.requestAnimationFrame(animation);
            } else {
                return;
            }
        }
        ctx.clearRect(0, 0, box.width, box.height);
        ctx.save();
        ctx.translate(box.width / 2, box.height / 2);
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        ctx.textAlign = "center";
        ctx.lineWidth = 12;
        ctx.arc(0, 0, radius, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.lineWidth = 0.5;
        ctx.arc(0, 0, radius + 15, beginAngle, -Math.PI / 2 + Math.PI * 6 / 7, false);
        ctx.moveTo(-radius * Math.sin(Math.PI / 7), radius * Math.cos(Math.PI / 7));
        ctx.lineTo(-(radius + 15) * Math.sin(Math.PI / 7), (radius + 15) * Math.cos(Math.PI / 7));
        ctx.moveTo(radius * Math.sin(Math.PI / 7), radius * Math.cos(Math.PI / 7));
        ctx.lineTo((radius + 15) * Math.sin(Math.PI / 7), (radius + 15) * Math.cos(Math.PI / 7));
        ctx.stroke();
        ctx.font = "normal 14px Microsoft YaHei";
        ctx.fillText('PM2.5', 0,125);
        ctx.font = "normal 30px Microsoft YaHei";
        ctx.fillText(pm25, 0, 6);
        ctx.closePath();
        ctx.beginPath();
        ctx.font = "normal 18px Microsoft YaHei";
        if (pm25 === -1) {
            ctx.restore();
            return;
        } else if (pm25 <= 50) {
            ctx.fillStyle = '#b1f71a';
            ctx.fillText('优', 0, 50);
            ctx.font = "normal 14px Microsoft YaHei";
            ctx.fillStyle = '#fff';
            ctx.fillText('空气优', 0, 155);
            strokeStyle = '#2ec300';
            finish = beginAngle + (pm25 / 50) * Math.PI * 2 / 7;
        } else if (pm25 <= 100) {
            ctx.fillStyle = '#b1f71a';
            ctx.fillText('良', 0, 50);
            ctx.font = "normal 14px Microsoft YaHei";
            ctx.fillStyle = '#fff';
            ctx.fillText('空气良', 0, 155);
            strokeStyle = '#b1f71a';
            finish = beginAngle + (pm25 / 50) * Math.PI * 2 / 7;
        } else if (pm25 <= 150) {
            ctx.fillStyle = '#fee400';
            ctx.fillText('轻度污染', 0, 50);
            ctx.font = "normal 14px Microsoft YaHei";
            ctx.fillStyle = '#fff';
            ctx.fillText('空气轻度污染', 0, 155);
            strokeStyle = '#fee400';
            finish = beginAngle + (pm25 / 50) * Math.PI * 2 / 7;
        } else if (pm25 <= 200) {
            ctx.fillStyle = '#ff7200';
            ctx.fillText('中度污染', 0, 50);
            ctx.font = "normal 14px Microsoft YaHei";
            ctx.fillStyle = '#fff';
            ctx.fillText('空气中度污染', 0, 155);
            strokeStyle = '#ff7200';
            finish = beginAngle + (pm25 / 50) * Math.PI * 2 / 7;
        } else if (pm25 <= 300) {
            ctx.fillStyle = '#ed0006';
            ctx.fillText('重度污染', 0, 50);
            ctx.font = "normal 14px Microsoft YaHei";
            ctx.fillStyle = '#fff';
            ctx.fillText('空气重度污染', 0, 155);
            strokeStyle = '#ed0006';
            finish = beginAngle + 4 * Math.PI * 2 / 7 + (pm25 / 100 - 2) * Math.PI * 2 / 7;
        } else if (pm25 <= 500) {
            ctx.fillStyle = '#bf003a';
            ctx.fillText('严重污染', 0, 50);
            ctx.font = "normal 14px Microsoft YaHei";
            ctx.fillStyle = '#fff';
            ctx.fillText('空气严重污染', 0, 155);
            strokeStyle = '#bf003a';
            finish = beginAngle + 5 * Math.PI * 2 / 7 + (pm25 - 300) / 200 * Math.PI * 2 / 7;
        } else {
            ctx.fillStyle = '#90002c';
            ctx.fillText('空气剧毒', 0, 50);
            ctx.font = "normal 14px Microsoft YaHei";
            ctx.fillStyle = '#fff';
            ctx.fillText('空气剧毒', 0, 155);
            strokeStyle = '#90002c';
            finish = beginAngle + 6 * Math.PI * 2 / 7 + (pm25 - 500) / 500 * Math.PI * 2 / 7;
        }
        imageData = ctx.getImageData(0, 0, box.width, box.height);
        var that = this;
        setTimeout(function () {
            window.requestAnimationFrame(animation);
        }, 400);
        ctx.closePath();
        ctx.restore();
    }();
    !function ShowTread() {
        var dateData = CWeatherCandler(new Date().getFullYear()+'-'+new Date().getMonth()+1+'-'+new Date().getDay());
        var trendData = [], // 趋势数据
            weather = [],
            weekData = [],
            trendText,
            weatherText;
        for (i = 0, len = data.weather_data.length; i < len; i++) { // 更新天气详情
            weekData[i] = data.weather_data[i].date.slice(0, 2);
        }
        for (i = 0, len = data.weather_data.length; i < len; i++) {
            trendText = data.weather_data[i].temperature;
            weatherText = data.weather_data[i].weather;
            trendData[i] = [];
            weather[i] = [];
            if (/\~/.test(trendText)) {
                trendData[i][0] = trendText.slice(0, trendText.indexOf('~') - 1);
                trendData[i][1] = trendText.slice(trendText.indexOf('~') + 2, trendText.length - 1);
            }else if (realtext != '') {
                trendData[i][0] = realtext.slice(0, realtext.length - 1);
                trendData[i][1] = trendText.slice(0, trendText.length - 1);
                if (trendData[i][0]*1 < trendData[i][1]*1) {
                    var temp = trendData[i][0];
                    trendData[i][0] = trendData[i][1];
                    trendData[i][1] = temp;
                }
            } else {
                trendData[i][0] = trendText.slice(0, trendText.length - 1);
                trendData[i][1] = trendData[i][0];
            }
            if (/\转/.test(weatherText)) {
                weather[i][0] = weatherText.slice(0, weatherText.indexOf('转'));
                weather[i][1] = weatherText.slice(weatherText.indexOf('转') + 1);
            } else {
                weather[i][0] = weatherText;
                weather[i][1] = weatherText;
            }
        }
        trendData.push(weather);
        trendData.push(dateData);
        trendData.push(weekData);
        var canvas = $("#CWeatherTread")[0],
            ctx = canvas.getContext('2d'),
            box = {
                width: canvas.width,
                height: canvas.height
            },
            average = box.width/8,
            max = Number(trendData[0][0]),
            min = Number(trendData[0][1]),
            center = 0,
            radius = 6,
            proportion,
            date,
            week,
            len = trendData.length;
        for (var i = 0; i < 4; i++) {
            if (Number(trendData[i][0]) > max) {
                max = Number(trendData[i][0]);
            }
            if (Number(trendData[i][1]) < min) {
                min = Number(trendData[i][1]);
            }
        }
        center = max - min; // 温差
        if (center <= 10) {
            proportion = 10;
        } else if (center <= 18) {
            proportion = 8;
        } else if (center <= 30) {
            proportion = 5;
        } else {
            proportion = 2;
        }
        center = (max + min)/2;
        ctx.clearRect(0, 0, box.width, box.height);
        ctx.strokeStyle = '#fff';
        ctx.font = "normal 14px Microsoft YaHei";
        ctx.fillStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.textAlign = "center";
        for (i = 1; i <= 4; i++) {
            date = trendData[len - 2][i - 1];
            week = trendData[len - 1][i - 1];
            ctx.beginPath();
            //ctx.fillText(/*date[0] + '/' + date[1] + ' ' + */week, average*(2*i - 1), box.height-30);显示日期
        }
        ctx.beginPath();
        ctx.save();
        ctx.translate(0, box.height/2);
        ctx.lineWidth = 2;
        ctx.textAlign = "center";
        ctx.font = "normal 16px Microsoft YaHei";
        for (i = 0; i < len - 3; i++) {
            ctx.beginPath();
            ctx.strokeStyle = '#fff';
            ctx.fillStyle = '#fff';
            ctx.fillText(trendData[i][1] + '°', average*(2*i + 1), (center - trendData[i][1])*proportion + 35);
            ctx.fillText(trendData[4][i][1], average*(2*i + 1), (center - trendData[i][1])*proportion + 55);
            ctx.arc(average*(2*i + 1), (center - trendData[i][1])*proportion, radius, 0, 2*Math.PI, false);
            ctx.fill();
            ctx.moveTo(average*(2*i + 1), (center - trendData[i][1])*proportion);
            ctx.lineTo(average*(2*i + 3), (center - trendData[i+1][1])*proportion);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = '#b1f71a';
            ctx.fillStyle = '#b1f71a';
            ctx.fillText(trendData[i][0] + '°', average*(2*i + 1), (center - trendData[i][0])*proportion - 20);
            ctx.fillText(trendData[4][i][0], average*(2*i + 1), (center - trendData[i][0])*proportion - 40);
            ctx.arc(average*(2*i + 1), (center - trendData[i][0])*proportion, radius, 0, 2*Math.PI, false);
            ctx.fill();
            ctx.moveTo(average*(2*i + 1), (center - trendData[i][0])*proportion);
            ctx.lineTo(average*(2*i + 3), (center - trendData[i+1][0])*proportion);
            ctx.stroke();
        }
        ctx.restore();
    }();
};
CloudWeather.GetWeather($.Cookie.get('city'));