CloudMain=$.NameSpace.register('CloudMain');
CloudMain.ServerUrl='http://cloud.com:100';
CloudMain.socketUrl='ws://10.3.16.32:9090';
CloudMain.UpdateServerUrl=function (a,url) {
    var testUrl=url?url:CloudMain.ServerUrl;
    $.Ajax({
        type: "post",
        url:testUrl,
        dataType: "text",
        success: function() {
            $.Toast('地址更新成功，测试可用');
            CloudMain.ServerUrl=testUrl;
            $.Cookie.set('ServerUrl',CloudMain.ServerUrl,315360000000);
            a?$.Window.Close(a):"";
        },
        error: function() {
            $.Toast('地址更新失败')
        }
    });
};
CloudMain.UpdatesocketUrl=function (url) {
    CloudMain.socketUrl=url
};
CloudMain.Ajax=function (options) {
    var param = {
        url: CloudMain.ServerUrl+options.url,
        type: "post",
        dataType:options.dataType?options.dataType:'json',
        contentType: !options.contentType?options.contentType:true,
        processData: !options.processData?options.processData:true,
        data: options.data,
        success: options.success?options.success:function (rs) {},
        error:options.error?function (xhr,states,code) {
            if(xhr.status===401) {
                $.Toast('未授权的请求');
                $.Cookie.remove('username');
                $.Cookie.remove('serveSESSID');
                setTimeout("window.location.href='./service/logout?e=1';", 1500);
            }
            options.error();
        }:function (xhr) {
            if(xhr.status===401) {
                $.Toast('未授权的请求');
                $.Cookie.remove('username');
                $.Cookie.remove('serveSESSID');
                setTimeout("window.location.href='./service/logout?e=1';", 1500);
            }
        }
    };
    return $.Ajax(param)
};
window.addEventListener( "dragenter", function (e) {
    e.preventDefault();
}, false);
window.addEventListener( "dragover", function (e) {
    e.preventDefault();
}, false );
window.addEventListener( "dragleave", function (e) {
    e.preventDefault();
}, false );
window.addEventListener( "drop", function (e) {
    e.preventDefault();
}, false );