CloudDict=$.NameSpace.register('CloudDict');
CloudDict.ChangeSelect=function(select){
    var type=select.data.type;
    var name=select.innerHTML;
    CloudDict.SelectButton.innerHTML=name+'<span class="sf-icon-angle-down"></span>';
    CloudDict.NowType=type;
    CloudDict.SelectMain.className='CloudDirtSelectMain animated zoomOut';
    var b=setTimeout(function () {
        CloudDict.SelectMain.style.display='none';
        clearTimeout(b)
    },500);
};
CloudDict.Query=function(query){
    if(CloudDict.Ping){
        $.Toast('正在执行上次的操作');
        return false
    }
    CloudDict.SearchContainer.innerHTML=CloudDict.Loading;
    CloudDict.Ping=true;
    CloudDict.Xhr=CloudMain.Ajax({
        url:'/service/dict/query',
        data:{
          query:query
        },
        success: function(rs) {
            CloudDict.Ping=false;
            CloudDict.Data=[];
            CloudDict.DictList=[];
            CloudDict.Explain=[];
            if(!rs||rs===null||(rs.length===0)||(!rs.fanyi&&!rs.simple)){
                CloudDict.SearchContainer.innerHTML=CloudDict.NoTips;
                return false;
            }
            if(rs.simple){
                CloudDict.Data.word=rs.simple.word[0]
            }else if(!rs.simple&&rs.fanyi){
                CloudDict.Data.word=[];
                CloudDict.Data.word['return-phrase']=rs.fanyi.input;
                CloudDict.Data.word["fanyi"]=rs.fanyi.tran;
            };//读音、音标
            if(rs.ec){
                CloudDict.DictList.push("简明");
                CloudDict.Data.Simple=rs.ec.word[0].trs;//简明词典
            }else{
                CloudDict.Data.Simple=[];
            }
            if(rs.longman){
                CloudDict.DictList.push("朗文");
                CloudDict.Data.longman=rs.longman.wordList;
            }else{
                CloudDict.Data.longman=[];
            }
            if(rs.collins) {
                CloudDict.DictList.push("柯林斯");
                CloudDict.Data.collins = rs.collins.collins_entries["0"].entries.entry;//柯林斯词典信息
            }else{
               CloudDict.Data.collins=[];
            }
            if(rs.ec21){
                CloudDict.DictList.push("21世纪词典");
                CloudDict.Data.ec21=rs.ec21.word[0]
            }else{
                CloudDict.Data.ec21=[];
            }
            if(rs.auth_sents_part){
                CloudDict.DictList.push("权威例句");
                CloudDict.Data.auth_sents_part=rs.auth_sents_part.sent;//权威例句
            }else{
                CloudDict.Data.auth_sents_part=[];
            }
            if(rs.blng_sents_part){
                CloudDict.DictList.push("双语例句");
                CloudDict.Data.blng_sents_part=rs.blng_sents_part["sentence-pair"];//双语例句
            }else{
                CloudDict.Data.blng_sents_part=[];
            }
            /*第二层导航数据开始*/
            if(rs.web_trans) {
                CloudDict.Explain.push("网络释义");
                CloudDict.Data.phrase = rs.web_trans["web-translation"];//词组短语
            }else{
                CloudDict.Data.phrase =[];
            }
            if(rs.ee){
                CloudDict.Explain.push("英英释义");
                CloudDict.Data.eeword=rs.ee.word.speech;//单词
                CloudDict.Data.eephone=rs.ee.word.phone;//音标
                CloudDict.Data.ee=rs.ee.word.trs;//英英释义
            }else{
                CloudDict.Data.ee=[];
            }
            if(rs.rel_word){
                CloudDict.Explain.push("同根词");
                CloudDict.Data.rel_word=rs.rel_word
            }else {
                CloudDict.Data.rel_word=[];
            }
            CloudDict.Print();
        },
        error: function() {
            CloudDict.Ping=false;
            $.Toast('出错了，稍后重试')
        }
    });
};
CloudDict.Tran=function(query){
    if(CloudDict.Ping){
        $.Toast('正在执行上次的操作');
        return false
    }
    CloudDict.TranButton.innerHTML='翻译中';
    CloudDict.TranTextarea[1].innerHTML='翻译中';
    CloudDict.Ping=true;
    CloudMain.Ajax({
        url:'/service/dict/Transate',
        data:{
            type:CloudDict.NowType,
            from:CloudDict.TranFrom,
            to: CloudDict.TranTo,
            query:query
        },
        success: function(rs) {
            CloudDict.Ping=false;
            CloudDict.TranTextarea[1].innerHTML='';
            CloudDict.TranButton.innerHTML='翻译';
            if(rs.errorCode===0){
                rs=rs.translateResult;
                for(var i=0;i<rs.length;i++){
                    var a=$.CreateElement({
                        tag:"p",
                        className:"CloudDict-Tran",
                        node:CloudDict.TranTextarea[1]
                    });
                    var b=$.CreateElement({
                        tag:"p",
                        className:'CloudDict-TranSrc',
                        node:CloudDict.TranTextarea[1]
                    });
                    for(var j=0;j<rs[i].length;j++){
                        (function (j) {
                            var c=$.CreateElement({
                                tag:"span",
                                html:rs[i][j].tgt,
                                node:a
                            });
                            var d=$.CreateElement({
                                tag:"span",
                                html:rs[i][j].src,
                                node:b
                            });
                            c.onmouseover=function () {
                                d.style.color="#f75454";
                                this.style.background=d.style.background="#d2d2d2";
                            };
                            c.onmouseout=function () {
                                d.removeAttribute('style');
                                this.removeAttribute('style');
                            };
                            d.onmouseover=function () {
                                c.style.color="#f75454";
                                this.style.background=c.style.background="#d2d2d2";
                            };
                            d.onmouseout=function () {
                                c.removeAttribute('style');
                                this.removeAttribute('style');
                            }
                        })(j);
                    }
                }
            }
        },
        error: function() {
            CloudDict.Ping=false;
            $.Toast('出错了，稍后重试')
        }
    });
};
CloudDict.NodeArea=function(name){
  return document.querySelectorAll("#CloudDict-"+name)[0]
};
CloudDict.Print=function(){
    CloudDict.SearchContainer.innerHTML='';
    $.CreateElement({
        tag:"p",
        className:'CloudDictWord',
        html:CloudDict.Data.word['return-phrase'],
        node:CloudDict.SearchContainer
    });
    if(CloudDict.Data.word["ukphone"]){
        $.CreateElement({
            tag:"span",
            className:'CloudDictSpeech',
            html:'英/'+CloudDict.Data.word["ukphone"],
            node:CloudDict.SearchContainer
        });
        var a=$.CreateElement({
            className:'CloudDictSpeech-audio sf-icon-volume-up',
            node:CloudDict.SearchContainer
        });
        $.CreateElement({
            tag:"audio",
            attr:{
                "src":"http://dict.youdao.com/dictvoice?audio="+CloudDict.Data.word["ukspeech"]
            },
            node:a
        });
        a.onclick=function(){
            CloudDict.PlaySpeech(this.children[0])
        };
    }
    if(CloudDict.Data.word["usphone"]){
        $.CreateElement({
            tag:"span",
            className:'CloudDictSpeech',
            html:'美/'+CloudDict.Data.word["usphone"],
            node:CloudDict.SearchContainer
        });
        var a1=$.CreateElement({
            className:'CloudDictSpeech-audio sf-icon-volume-up',
            node:CloudDict.SearchContainer
        });
        a1.onclick=function(){
            CloudDict.PlaySpeech(this.children[0])
        };
        $.CreateElement({
            tag:"audio",
            attr:{
                "src":"http://dict.youdao.com/dictvoice?audio="+CloudDict.Data.word["usspeech"]
            },
            node:a1
        });
    }
    if(CloudDict.Data.word["fanyi"]){
        $.CreateElement({
            tag:"span",
            className:'CloudDictSpeech',
            html:'翻译：'+CloudDict.Data.word["fanyi"],
            node:CloudDict.SearchContainer
        });
        var a1=$.CreateElement({
            className:'CloudDictSpeech-audio sf-icon-volume-up',
            node:CloudDict.SearchContainer
        });
        a1.onclick=function(){
            CloudDict.PlaySpeech(this.children[0])
        };
        $.CreateElement({
            tag:"audio",
            attr:{
                "src":"http://dict.youdao.com/dictvoice?audio="+CloudDict.Data.word["return-phrase"]
            },
            node:a1
        });
    }
    /*打印词典导航*/
    if(CloudDict.DictList.length) {
        var nav = $.CreateElement({
            tag: "ul",
            className: 'CloudDictSNav',
            node: CloudDict.SearchContainer
        });
        var nav_li = [];
        var nav_block = [];
        for (var i = 0; i < CloudDict.DictList.length; i++) {
            nav_li[i] = $.CreateElement({
                tag: "li",
                html: CloudDict.DictList[i],
                node: nav
            });
            nav_block[i] = $.CreateElement({
                id: "CloudDict-" + CloudDict.DictList[i],
                className: 'CloudDictSNavArea',
                node: CloudDict.SearchContainer
            });
        }
        for (i = 0; i < nav_li.length; i++) {
            (function (i) {
                nav_li[i].onclick = function () {
                    for (var j = 0; j < nav_li.length; j++) {
                        nav_li[j].className = '';
                        nav_block[j].style.display = 'none';
                    }
                    nav_li[i].className = 'CloudDictSNavActive';
                    nav_block[i].style.display = 'block'
                }
            })(i);
        }
        nav_li[0].click();
    }
    /*打印简明词典*/
    if(CloudDict.NodeArea('简明')) {
        a = $.CreateElement({
            className: 'CloudDictDictContent',
            node: CloudDict.NodeArea('简明')
        });
        for (i = 0; i < CloudDict.Data.Simple.length; i++) {
            $.CreateElement({
                tag: "p",
                html: CloudDict.Data.Simple[i].tr[0]["l"]["i"],
                node: a
            });
        }
    }
    /*打印朗文词典,很容易出错*/
    try{
        if( CloudDict.NodeArea('朗文')) {
            for (i = 0; i < CloudDict.Data.longman.length; i++) {
                a = $.CreateElement({
                    className: 'CloudDictLongmanMain',
                    node: CloudDict.NodeArea('朗文')
                });
                var b = $.CreateElement({
                    node: a
                });
                $.CreateElement({
                    tag: "span",
                    html: CloudDict.Data.longman[i].Entry.Head[0].HYPHENATION[0],
                    className: 'CloudDictRHead-word',
                    node: b
                });
                if (CloudDict.Data.longman[i].Entry.Head[0].PronCodes) {
                    $.CreateElement({
                        tag: "span",
                        html: '/' + CloudDict.Data.longman[i].Entry.Head[0].PronCodes[0].PRON + '/',
                        className: 'CloudDictRHead-phonetic',
                        node: b
                    });
                }
                var Sense = CloudDict.Data.longman[i].Entry.Sense || CloudDict.Data.longman[i].Entry.PhrVbEntry[0].Sense;
                for (var j = 0; j < Sense.length; j++) {
                    var GramExa = Sense[j].GramExa;
                    var c = $.CreateElement({
                        className: 'CloudDictDictContent',
                        node: CloudDict.NodeArea('朗文')
                    });
                    var EXAMPLE = Sense[j].SIGNPOST || Sense[j].EXAMPLE || Sense[j].DEF | Sense[j].LEXUNIT || Sense[j].GRAM || Sense[j].Subsense[0].EXAMPLE;
                    var TRAN = Sense[j].SIGNTRAN || Sense[j].EXAMPLETRAN || Sense[j].TRAN || Sense[j].Subsense[0].EXAMPLETRAN;
                    if (EXAMPLE && TRAN) {
                        $.CreateElement({
                            tag: "span",
                            html: j + 1 + '.',
                            node: c
                        });
                        $.CreateElement({
                            tag: "p",
                            html: '<b>' + ((EXAMPLE)[0]) + ' ' + ((TRAN)[0]) + '</b>',
                            node: c
                        });
                    }
                    if (Sense[j].DEF) {
                        $.CreateElement({
                            tag: "p",
                            className: 'GRAM_Padding',
                            html: Sense[j].DEF[0] + ' ' + Sense[j].TRAN[0],
                            node: c
                        });
                    }
                    if (j === 0 && GramExa) {
                        for (var k = 0; k < GramExa.length; k++) {
                            for (var k1 = 0; k1 < GramExa[k].EXAMPLETRAN.length; k1++) {
                                $.CreateElement({
                                    tag: "p",
                                    className: "eng_sent",
                                    html: GramExa[k].EXAMPLE[k1],
                                    node: c
                                });
                                $.CreateElement({
                                    tag: "p",
                                    className: "eng_sent",
                                    html: GramExa[k].EXAMPLETRAN[k1],
                                    node: c
                                });
                            }
                        }
                    }
                }
            }
        }
    }catch (e) {}
    /*打印柯林斯词典数据*/
    if(CloudDict.NodeArea('柯林斯')) {
        $.CreateElement({
            tag: "span",
            html: CloudDict.Data.word["return-phrase"],
            className: 'CloudDictRHead-word',
            node: CloudDict.NodeArea('柯林斯')
        });
        $.CreateElement({
            tag: "span",
            html: '/' + CloudDict.Data.word.usphone + '/',
            className: 'CloudDictRHead-phonetic',
            node: CloudDict.NodeArea('柯林斯')
        });
        for (i = 0; i < CloudDict.Data.collins.length; i++) {
            a = $.CreateElement({
                className: 'CloudDictDictContent',
                node: CloudDict.NodeArea('柯林斯')
            });
            $.CreateElement({
                tag: "span",
                html: i + 1 + '.',
                node: a
            });
            $.CreateElement({
                tag: "p",
                html: CloudDict.Data.collins[i].tran_entry[0].tran || (CloudDict.Data.collins[i].tran_entry[0].headword),
                node: a
            });
            if (CloudDict.Data.collins[i].tran_entry[0].exam_sents) {
                $.CreateElement({
                    tag: "p",
                    className: 'eng_sent',
                    html: CloudDict.Data.collins[i].tran_entry[0].exam_sents.sent[0].eng_sent,
                    node: a
                });
                $.CreateElement({
                    tag: "p",
                    className: 'eng_sent',
                    html: CloudDict.Data.collins[i].tran_entry[0].exam_sents.sent[0].chn_sent,
                    node: a
                });
            }
        }
    }
    /*打印21世纪词典数据*/
    if(CloudDict.NodeArea('21世纪词典')) {
        $.CreateElement({
            tag:"span",
            html:CloudDict.Data.word["return-phrase"],
            className:'CloudDictRHead-word',
            node:CloudDict.NodeArea('21世纪词典')
        });
        $.CreateElement({
            tag:"span",
            html:'/'+CloudDict.Data.word.usphone+'/',
            className:'CloudDictRHead-phonetic',
            node:CloudDict.NodeArea('21世纪词典')
        });
        a=$.CreateElement({
            className:'CloudDictDictContent',
            node:CloudDict.NodeArea('21世纪词典')
        });
        var trs = CloudDict.Data.ec21.trs;
        for (i = 0; i < trs.length; i++) {
           $.CreateElement({
                tag: "p",
                html: trs[i].pos,
                node: a
            });
            var tr = trs[i].tr;
            for (var j = 0; j < tr.length; j++) {
                a = $.CreateElement({
                    className: 'CloudDictDictContent',
                    node: CloudDict.NodeArea('21世纪词典')
                });
                $.CreateElement({
                    tag: "span",
                    html: j + 1 + '.',
                    node: a
                });
                $.CreateElement({
                    tag: "p",
                    html: tr[j]["l"]["i"],
                    node: a
                });
                if (tr[j].exam) {
                    $.CreateElement({
                        tag: "p",
                        className: 'eng_sents',
                        html: tr[j].exam[0]["i"]["f"]["l"]["i"],
                        node: a
                    });
                    $.CreateElement({
                        tag: "p",
                        className: 'eng_sents',
                        html: tr[j].exam[0]["i"]["n"]["l"]["i"],
                        node: a
                    });
                }
            }
        }
        if (CloudDict.Data.ec21.phrs) {
            $.CreateElement({
                tag: "span",
                style: {"color": "#000", "width": "unset"},
                html: '词组短语',
                node: $.CreateElement({
                    className: 'CloudDictDictContent',
                    node: CloudDict.NodeArea('21世纪词典')
                })
            });
            var phrs = CloudDict.Data.ec21.phrs[0]["i"];
            for (i = 0; i < phrs.length; i++) {
                a = $.CreateElement({
                    className: 'CloudDictDictContent',
                    node: CloudDict.NodeArea('21世纪词典')
                });
                $.CreateElement({
                    tag: "span",
                    html: i + 1 + '.',
                    node: a
                });
                $.CreateElement({
                    tag: "p",
                    html: "<b>" + phrs[i].phr["l"]["i"] + '</b>',
                    node: a
                });
                /*这里判断是否有多个解释*/
                if (phrs[i].tr) {
                    var tr = phrs[i].tr;
                    for (var k = 0; k < tr.length; k++) {
                        $.CreateElement({
                            tag: "p",
                            className: 'eng_sent',
                            html: tr[k]["l"]["i"],
                            node: a
                        });
                    }
                } else {
                    $.CreateElement({
                        tag: "p",
                        className: 'eng_sent',
                        html: phrs[i].des["l"]["i"],
                        node: a
                    });
                }
            }
        }
    }
    /*打印权威例句*/
    if(CloudDict.NodeArea('权威例句')) {
        for (i = 0; i < CloudDict.Data.auth_sents_part.length; i++) {
            a = $.CreateElement({
                className: 'CloudDictDictContent',
                node: CloudDict.NodeArea('权威例句')
            });
            $.CreateElement({
                tag: "span",
                html: i + 1 + '.',
                node: a
            });
            b = $.CreateElement({
                tag: "p",
                html: CloudDict.Data.auth_sents_part[i].foreign,
                node: a
            });
            CloudDict.BindSpeech(b,CloudDict.Data.auth_sents_part[i].speech);
            $.CreateElement({
                tag: "p",
                className: 'eng_sents',
                html: CloudDict.Data.auth_sents_part[i].source,
                node: a
            });
        }
    }
    /*打印双语例句*/
    if(CloudDict.NodeArea('双语例句')) {
        for (i = 0; i < CloudDict.Data.blng_sents_part.length; i++) {
            a = $.CreateElement({
                className: 'CloudDictDictContent',
                node: CloudDict.NodeArea('双语例句')
            });
            $.CreateElement({
                tag: "span",
                html: i + 1 + '.',
                node: a
            });
            b = $.CreateElement({
                tag: "p",
                html: CloudDict.Data.blng_sents_part[i]["sentence-eng"],
                node: a
            });
            CloudDict.BindSpeech(b,CloudDict.Data.blng_sents_part[i]["sentence-speech"]);
            $.CreateElement({
                tag: "p",
                className: 'eng_sents',
                html: CloudDict.Data.blng_sents_part[i]["sentence-translation"],
                node: a
            });
            $.CreateElement({
                tag: "p",
                className: 'eng_sent',
                html: CloudDict.Data.blng_sents_part[i]["url"],
                node: a
            });
        }
    }
    /*打印词组导航*/
    if(CloudDict.Explain.length) {
        var Explain_nav = [];
        var Explain_Block = [];
        nav = $.CreateElement({
            tag: "ul",
            className: 'CloudDictSNav',
            node: CloudDict.SearchContainer
        });
        for (i = 0; i < CloudDict.Explain.length; i++) {
            Explain_nav[i] = $.CreateElement({
                tag: "li",
                html: CloudDict.Explain[i],
                node: nav
            });
            Explain_Block[i] = $.CreateElement({
                id: "CloudDict-" + CloudDict.Explain[i],
                className: 'CloudDictSNavArea',
                node: CloudDict.SearchContainer
            });
        }
        for (i = 0; i < Explain_nav.length; i++) {
            (function (i) {
                Explain_nav[i].onclick = function () {
                    for (var j = 0; j < Explain_nav.length; j++) {
                        Explain_nav[j].className = '';
                        Explain_Block[j].style.display = 'none';
                    }
                    Explain_nav[i].className = 'CloudDictSNavActive';
                    Explain_Block[i].style.display = 'block'
                }
            })(i);
        }
        Explain_nav[0].click();
    }
    /*打印网络释义*/
    if(CloudDict.NodeArea("网络释义")) {
        var tran_list=CloudDict.Data.phrase[0].trans;
        for(i=0;i<tran_list.length;i++){
            a = $.CreateElement({
                className: 'CloudDictDictContent',
                node: CloudDict.NodeArea("网络释义")
            });
            $.CreateElement({
                tag: "p",
                html:'<b style="color:#F75454">'+tran_list[i].value+'</b>',
                node: a
            });
            if(tran_list[i].summary) {
                $.CreateElement({
                    tag: "p",
                    className: 'eng_sents',
                    html: tran_list[i].summary.line,
                    node: a
                });
            }
        }
        a = $.CreateElement({
            className: 'CloudDictDictContent',
            node: CloudDict.NodeArea("网络释义")
        });
        $.CreateElement({
            tag: "p",
            html:"<b>词组短语</b>",
            node: a
        });
        for(i=0;i<CloudDict.Data.phrase.length;i++){
            a = $.CreateElement({
                className: 'CloudDictDictContent',
                node: CloudDict.NodeArea("网络释义")
            });
            $.CreateElement({
                tag: "span",
                html: i + 1 + '.',
                node: a
            });
            b = $.CreateElement({
                tag: "p",
                node: a
            });
            $.CreateElement({
                className: 'CloudDict-similar',
                html: CloudDict.Data.phrase[i].key,
                node: b
            }).onclick = function () {
                CloudDict.SearchInput.innerHTML = this.innerHTML;
                CloudDict.SearchControl[1].click();
            };
            var tran=CloudDict.Data.phrase[i].trans;
            for (j=0;j<tran.length;j++){
                $.CreateElement({
                    className:'CloudDict-web-tran',
                    html: tran[j].value,
                    node: b
                });
            }
            CloudDict.BindSpeech(b,CloudDict.Data.phrase[i]["key-speech"]);
        }
    }
    /*打印英英释义*/
    if(CloudDict.NodeArea("英英释义")) {
        $.CreateElement({
            tag: "span",
            html: CloudDict.Data.eeword,
            className: 'CloudDictRHead-word',
            node: CloudDict.NodeArea("英英释义")
        });
        $.CreateElement({
            tag: "span",
            html: '/' + CloudDict.Data.eephone + '/',
            className: 'CloudDictRHead-phonetic',
            node: CloudDict.NodeArea("英英释义")
        });
        a = $.CreateElement({
            className: 'CloudDictDictContent',
            node: CloudDict.NodeArea("英英释义")
        });
        for (i = 0; i < CloudDict.Data.ee.length; i++) {
            b = $.CreateElement({
                tag: "p",
                node: a
            });
            $.CreateElement({
                tag: "span",
                style: {"color": "#000"},
                html: CloudDict.Data.ee[i].pos,
                node: b
            });
            var tr = CloudDict.Data.ee[i].tr;
            for (var j = 0; j < tr.length; j++) {
                a = $.CreateElement({
                    className: 'CloudDictDictContent',
                    node: CloudDict.NodeArea("英英释义")
                });
                $.CreateElement({
                    tag: "span",
                    html: j + 1 + '.',
                    node: a
                });
                $.CreateElement({
                    tag: "p",
                    html: tr[j]["l"]["i"],
                    node: a
                });
                if (tr[j].exam) {
                    $.CreateElement({
                        tag: "p",
                        className: 'eng_sents',
                        html: tr[j].exam.i.f.l["0"].i,
                        node: a
                    });
                }
                if (tr[j]["similar-words"]) {
                    var similar = tr[j]["similar-words"];
                    var c = $.CreateElement({
                        tag: "p",
                        className: 'CloudDict-similar-Line',
                        html: "<div>近义词:</div>",
                        node: a
                    });
                    for (k = 0; k < similar.length; k++) {
                        $.CreateElement({
                            className: 'CloudDict-similar',
                            html: similar[k].similar,
                            node: c
                        }).onclick = function () {
                            CloudDict.SearchInput.innerHTML = this.innerHTML;
                            CloudDict.SearchControl[1].click();
                        };
                    }
                }
            }
        }
    }
    /*打印同根词*/
    if(CloudDict.NodeArea("同根词")) {
        a = $.CreateElement({
            className: 'CloudDictDictContent',
            node: CloudDict.NodeArea("同根词")
        });
        $.CreateElement({
            tag: "span",
            style:{"width":"unset"},
            html:'词根：',
            node: a
        });
        $.CreateElement({
            className:'CloudDict-similar',
            html:'<b>'+CloudDict.Data.rel_word.word+'</b>',
            node: a
        }).onclick = function () {
            CloudDict.SearchInput.innerHTML = this.innerHTML;
            CloudDict.SearchControl[1].click();
        };
        var rel=CloudDict.Data.rel_word.rels;
        for (i =0; i <rel.length;i++){
            a = $.CreateElement({
                className: 'CloudDictDictContent',
                node: CloudDict.NodeArea("同根词")
            });
            $.CreateElement({
                tag: "p",
                html: rel[i].rel.pos,
                node: a
            });
            b=$.CreateElement({
                tag: "p",
                className:'CloudDict-similar-Line',
                node: a
            });
            var words=rel[i].rel.words;
            for(j=0;j<words.length;j++){
                b=$.CreateElement({
                    tag: "p",
                    className:'CloudDict-similar-Line',
                    node: a
                });
                $.CreateElement({
                    className:'CloudDict-similar',
                    html:words[j].word,
                    node: b
                }).onclick = function () {
                    CloudDict.SearchInput.innerHTML = this.innerHTML;
                    CloudDict.SearchControl[1].click();
                };
                $.CreateElement({
                    className:'CloudDict-web-tran',
                    html:words[j].tran,
                    node: b
                });
                CloudDict.BindSpeech(b,words[j].word)
            }
        }
    }
};
CloudDict.BindSpeech=function(node,content){
    var aa = $.CreateElement({
        style:{"float":"unset"},
        className: 'CloudDictSpeech-audio sf-icon-volume-up',
        node: node
    });
    $.CreateElement({
        tag: "audio",
        attr: {
            "src": "http://dict.youdao.com/dictvoice?audio=" + content
        },
        node: aa
    });
    aa.onclick = function () {
        CloudDict.PlaySpeech(this.children[0])
    };
};
CloudDict.PlaySpeech=function(speech){
    var audio=$(".CloudDictMain audio");
    for(var i=0;i<audio.length;i++){
        audio[i].currentTime=0;
        audio[i].pause();
    }
    speech.play();
};
CloudDict.Init=function () {
    var SelectTag=[];
    var DataObject = new Date();
    CloudDict.Ping=false;
    CloudDict.Loading="<div class='CloudDictLoading'><span class='sf-icon-book'></span><p>正在查询</p></div>";
    CloudDict.NoTips="<div class='CloudDictLoading'><span class='sf-icon-book'></span><p>没有相关记录</p></div>";
    CloudDict.Main=$(".CloudDictMain")[0];
    CloudDict.Nav=$(".CloudDictMenu li");
    CloudDict.InputTitle=$(".CloudDictInputTitle")[0];
    CloudDict.NavMain=$(".CloudDictContainer");
    CloudDict.SelectButton=$(".CloudDictSelect")[0];
    CloudDict.SelectMain=$(".CloudDirtSelectMain")[0];
    CloudDict.InputBig=$(".CloudDictInput")[0];
    CloudDict.SearchInput=$('.CloudDictSearchInput')[0];
    CloudDict.SearchContainer=$(".CloudDictSearchContainer")[0];
    CloudDict.ToTopButton=$(".CloudDictToTop")[0];
    CloudDict.TranButton=$(".CloudDict-TranButton")[0];
    CloudDict.TranTo="auto";
    CloudDict.TranFrom="auto";
    CloudDict.NowType='';
    CloudDict.TransLation=[
        {"desp":"自动检测语言","from":"auto","to":"auto","type":"null"},
        {"desp":"中文-英语","from":"zh-CHS","to":"en","type":"ZH_CN2EN"},
        {"desp":"英语-中文","from":"en","to":"zh-CHS","type":"EN2ZH_CN"},
        {"desp":"中文-日语","from":"zh-CHS","to":"ja","type":"ZH_CN2JA"},
        {"desp":"日语-中文","from":"ja","to":"zh-CHS","type":"JA2ZH_CN"},
        {"desp":"中文-韩语","from":"zh-CHS","to":"ko","type":"ZH_CN2KR"},
        {"desp":"韩语-中文","from":"ko","to":"zh-CHS","type":"KR2ZH_CN"},
        {"desp":"中文-法语","from":"zh-CHS","to":"fr","type":"KR2ZH_CN"},
        {"desp":"法语-中文","from":"fr","to":"zh-CHS","type":"FR2ZH_CN"},
        {"desp":"中文-俄语","from":"zh-CHS","to":"ru","type":"ZH-CHS2ru"},
        {"desp":"俄语-中文","from":"ru","to":"zh-CHS","type":"zh-CHS2ru"},
        {"desp":"中文-西班牙语","from":"zh-CHS","to":"es","type":"zh-CHS2ru"},
        {"desp":"西班牙语-中文","from":"es","to":"zh-CHS","type":"es2zh-CHS"},
        {"desp":"中文-葡萄牙语","from":"zh-CHS","to":"pt","type":"zh-CHS2pt"},
        {"desp":"葡萄牙语-中文","from":"pt","to":"zh-CHS","type":"pt2zh-CHS"},
        {"desp":"中文-越南语","from":"zh-CHS","to":"vi","type":"zh-CHS2vi"},
        {"desp":"越南语-中文","from":"vi","to":"zh-CHS","type":"vi2zh-CHS"}
    ];
    CloudDict.DictList=["简明","朗文","柯林斯","21世纪词典"];
    CloudDict.Explain=["英英释义","同根词","词组短语","同近义词"];
    CloudDict.SearchMaIn=$(".CloudDictSearchMain")[0];
    CloudDict.SearchControl=$(".CloudDictSearchHead button");
    CloudDict.ControlBtn=$(".CloudDict-BtnContainer *");
    CloudDict.Bottom=$(".CloudDictBottom *");
    CloudDict.TranTextarea=$(".CloudDictTextarea");
    CloudDict.Month=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    CloudDict.Week=["Sunday "," Monday "," Tuesday "," Wednesday "," Thursday "," Friday "," Saturday"];
    CloudDict.NowType=null;//默认自动检测语言
    CloudDict.Data=[];
    CloudDict.Bottom[0].innerHTML=DataObject.getDate();
    CloudDict.Bottom[1].innerHTML= CloudDict.Month[DataObject.getMonth()];
    CloudDict.Bottom[2].innerHTML=CloudDict.Week[DataObject.getDay()];
    CloudDict.SelectButton.onclick=function (e) {
        e.stopPropagation();
        if(CloudDict.SelectMain.offsetWidth){
            CloudDict.SelectMain.className='CloudDirtSelectMain animated zoomOut';
            var b=setTimeout(function () {
                CloudDict.SelectMain.style.display='none';
                clearTimeout(b)
            },500);
        }else {
            CloudDict.SelectMain.className='CloudDirtSelectMain animated zoomIn';
            CloudDict.SelectMain.style.display='block';
        }
    };
    CloudDict.TranTextarea[0].onkeydown=function(e){
        e = window.event||arguments[0];
        if(e.keyCode===13){
            window.event.returnValue = false;
            CloudDict.TranButton.click();
        }
    };
    CloudDict.TranButton.onclick=function () {
        if(!CloudDict.TranTextarea[0].value){
            $.Toast('请输入需要翻译的内容');
            return false;
        }
        CloudDict.Tran(CloudDict.TranTextarea[0].value)
    };
    for(var i=0;i<CloudDict.Nav.length;i++){
        (function (i) {
            CloudDict.Nav[i].onclick=function () {
                for(var j=0;j<CloudDict.Nav.length;j++){
                    CloudDict.Nav[j].className='';
                    CloudDict.NavMain[j].style.display='none';
                }
                CloudDict.Nav[i].className='CloudDictMenuActive';
                CloudDict.NavMain[i].style.display='block';
                if(i===1) {
                    CloudDict.SearchMaIn.style.display = 'none';
                }else if(i===0&&CloudDict.SearchContainer.innerHTML!=='') {
                    CloudDict.SearchMaIn.style.display = 'block';
                }
            }
        })(i)
    }
    for(var j=0;j<CloudDict.TransLation.length;j++){
        (function (j) {
            SelectTag[j]=$.CreateElement({
                html:CloudDict.TransLation[j].desp,
                node:CloudDict.SelectMain
            });
            SelectTag[j].data={"type":CloudDict.TransLation[j].type};
            SelectTag[j].onclick=function () {
               for(var i=0;i<SelectTag.length;i++){
                   SelectTag[i].className=''
               }
               SelectTag[j].className='CloudDictSelectActive';
                CloudDict.TranTo=CloudDict.TransLation[j].to;
                CloudDict.TranFrom=CloudDict.TransLation[j].from;
               CloudDict.ChangeSelect(this);
            }
        })(j)
    }
    SelectTag[0].style.width='100%';
    SelectTag[0].className='CloudDictSelectActive';
    CloudDict.Main.onmousedown=function () {
        if(CloudDict.SelectMain.offsetWidth) {
            CloudDict.SelectMain.className = 'CloudDirtSelectMain animated zoomOut';
            var b = setTimeout(function () {
                CloudDict.SelectMain.style.display = 'none';
                clearTimeout(b)
            }, 500);
        }
    };
    CloudDict.SearchControl[0].onclick=function(){
        CloudDict.InputBig.value = '';
        CloudDict.InputBig.focus();
        CloudDict.Nav[0].click();
        CloudDict.Xhr ? CloudDict.Xhr.abort() : "";
        CloudDict.Ping = false;
        CloudDict.SearchMaIn.style.display = 'none';
        CloudDict.SearchContainer.innerHTML = '';
    };
    CloudDict.SearchControl[1].onclick=function(){
        CloudDict.Query(CloudDict.SearchInput.innerHTML);
    };
    CloudDict.ControlBtn[0].onclick=function(){
        if($(".CloudDict-TranSrc")[0].offsetWidth){
            $(".CloudDict-TranSrc").hide()
        }else {
            $(".CloudDict-TranSrc").show()
        }
    };
    CloudDict.ControlBtn[1].onclick=function(){
        if(CloudDict.TranTextarea[1].offsetHeight===214){
            CloudDict.TranTextarea[1].parentNode.style.height='calc(100% - 85px)';
            CloudDict.InputTitle.style.height='0%';
            CloudDict.TranTextarea[0].parentNode.style.height='0%';
            CloudDict.TranButton.className="CloudDict-TranButton-pos";
        }else{
            CloudDict.InputTitle.removeAttribute('style');
            CloudDict.TranTextarea[1].parentNode.removeAttribute('style');
            CloudDict.TranTextarea[0].parentNode.removeAttribute('style');
            CloudDict.TranButton.className="CloudDict-TranButton";
        }
    };
    CloudDict.InputBig.onkeydown=function(e){
        e = window.event||arguments[0];
        if(e.keyCode===13){
            window.event.returnValue = false;
            CloudDict.SearchControl[1].click();
        }
        CloudDict.InputBig.onkeyup=function (ev) {
            if(this.value.length){
                CloudDict.SearchMaIn.style.display='block';
            }else{
                CloudDict.InputBig.value='';
                CloudDict.InputBig.focus();
                CloudDict.Nav[0].click();
            }
            CloudDict.SearchInput.innerHTML=this.value;
            CloudDict.SearchInput.scrollTop= CloudDict.SearchInput.scrollHeight
        }
    };
    CloudDict.SearchInput.onkeydown=function(e){
        e = window.event||arguments[0];
        if(e.keyCode===13){
            window.event.returnValue = false;
            CloudDict.SearchControl[1].click();
        }
    };
    CloudDict.SearchInput.onpaste=function(e){
        e.preventDefault();
        var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData;
        var pasteText = void 0;
        if (clipboardData == null) {
            pasteText = window.clipboardData || window.clipboardData.getData('text');
        } else {
            pasteText = clipboardData.getData('text/plain');
        }
        pasteText = pasteText.replace(/<(meta|script|link).+?>/igm, '');
        //去掉注释
        pasteText = pasteText.replace(/<!--.*?-->/mg, '');
        pasteText = pasteText.replace(/\s?(class|style)=('|").+?('|")/igm, '');//去除样式
        pasteText = pasteText.replace(/</gm, '&lt;').replace(/"/gm, '&quot;').replace(/\n/gm, '<br>').replace(/\n/gm, '</br>');
        this.innerHTML=pasteText
    };
    CloudDict.SearchInput.onkeyup=function(){
        if(!this.innerHTML.length){
            CloudDict.InputBig.value='';
            CloudDict.InputBig.focus();
            CloudDict.Nav[0].click();
            CloudDict.SearchMaIn.style.display = 'none';
            CloudDict.SearchContainer.innerHTML='';
        }
    };
    CloudDict.InputBig.focus();
    CloudDict.SearchContainer.onmousewheel=function(){
        if(this.scrollTop>100) {
            CloudDict.ToTopButton.style.display = "block";
        }else{
            CloudDict.ToTopButton.style.display = "none";
        }
    };
    CloudDict.ToTopButton.onclick=function () {
        var timer = null;
        cancelAnimationFrame(timer);
        timer = requestAnimationFrame(function fn() {
            var oTop = CloudDict.SearchContainer.scrollTop;
            if (oTop > 0) {
                CloudDict.SearchContainer.scrollTop = CloudDict.SearchContainer.scrollTop = oTop - (oTop / 3);
                timer = requestAnimationFrame(fn)
            } else {
                cancelAnimationFrame(timer)
            }
            CloudDict.SearchContainer.onmousewheel()
        })
    }
}();