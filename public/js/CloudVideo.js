CloudVideo = $.NameSpace.register('CloudVideo');
CloudVideo.GetRecommend = function(data) {
    if (data === 0) {
        CloudVideo.RecommendPage.innerHTML = CloudVideo.Loading
    }
    CloudVideo.GetRecommend.Next = null;
    CloudMain.Ajax({
        url:"/service/video/Recommend",
        data: {
            data: data
        },
        success: function(rs) {
            if (data === 0) {
                CloudVideo.RecommendPage.innerHTML = ''
            }
            var videoList = rs.itemList;
            var cover, author, title, time, playInfo, playUrl, tag, category, description, videoId;
            for (var i = 0; i < videoList.length; i++) {
                if (videoList[i].type === 'video') {
                    cover = videoList[i].data.cover.detail;
                    author = videoList[i].data.author;
                    title = videoList[i].data.title;
                    time = videoList[i].data.duration;
                    playInfo = videoList[i].data.playInfo;
                    playUrl = videoList[i].data.playUrl;
                    tag = videoList[i].data.tags;
                    category = videoList[i].data.category;
                    description = videoList[i].data.description;
                    videoId = videoList[i].data.id;
                    CloudVideo.PrintRecommend(cover, author, title, time, playInfo, playUrl, tag, category, description, videoId, CloudVideo.RecommendPage)
                }
                if (videoList[i].type === 'videoCollectionWithCover' || videoList[i].type === 'videoCollectionOfFollow' || videoList[i].type === 'videoCollectionOfAuthorWithCover') {
                    var list = videoList[i].data.itemList;
                    for (var j = 0; j < list.length; j++) {
                        cover = list[j].data.cover.detail;
                        author = list[j].data.author;
                        title = list[j].data.title;
                        time = list[j].data.duration;
                        playInfo = list[j].data.playInfo;
                        playUrl = list[j].data.playUrl;
                        tag = list[j].data.tags;
                        category = list[j].data.category;
                        description = list[j].data.description;
                        videoId = list[j].id;
                        CloudVideo.PrintRecommend(cover, author, title, time, playInfo, playUrl, tag, category, description, videoId, CloudVideo.RecommendPage)
                    }
                }
            }
            CloudVideo.GetRecommend.Next = rs.nextPageUrl ? rs.nextPageUrl.split('?')[1] : null;
            if (CloudVideo.GetRecommend.Next === null) {
                $.CreateElement({
                    className: 'CloudVideoList',
                    style: {
                        "background": 'rgb(81, 81, 81)',
                        'text-align': "center",
                        "color": "#fff",
                        "line-height": "150px"
                    },
                    html: '已经没有更多内容了',
                    node: CloudVideo.RecommendPage
                })
            }
            if (data === 0 && CloudVideo.RecommendPage.scrollTop === 0) {
                CloudVideo.GetRecommend(CloudVideo.GetRecommend.Next)
            }
        }
    })
};
CloudVideo.PrintRecommend = function(cover, author, title, time, playInfo, playUrl, tag, category, description, videoId, where) {
    var icon = author ? author.icon : "public/img/bar/themes2/video.png";
    var name = author ? author.name : "CloudVideo";
    var auth_description = author ? author.description : " ";
    var a = $.CreateElement({
        className: 'CloudVideoList',
        style: {
            "background": "url(" + cover + ")"
        },
        node: where
    });
    a.data = {
        "videoId": videoId,
        "cover": cover,
        "title": title,
        "time": time,
        "author": author,
        "description": description,
        "playInfo": playInfo,
        "playUrl": playUrl,
        "category": category,
        "tags": tag
    };
    var b = $.CreateElement({
        className: 'CloudVideoListHead',
        node: a
    });
    $.CreateElement({
        tag: "p",
        html: title,
        node: b
    });
    $.CreateElement({
        tag: "span",
        html: $.Time.sDeal(time),
        node: b
    });
    var c = $.CreateElement({
        className: 'CloudVideoListInfo',
        style: {
            "display": "none"
        },
        node: a
    });
    $.CreateElement({
        style: {
            "line-height": "30px",
            "font-size": "14px"
        },
        html: '<img src=' + icon + '><p>' + name + '</p>',
        node: c
    });
    $.CreateElement({
        tag: "span",
        html: auth_description,
        node: c
    });
    a.onmouseover = function() {
        b.style.opacity = 0;
        c.removeAttribute('style');
        c.style.display = 'block'
    };
    a.onmouseout = function() {
        b.style.opacity = 1;
        c.style.animationName = 'fadeOutDown';
        c.style.webkitAnimationName = 'fadeOutDown'
    };
    a.onclick = function() {
        CloudVideo.PreparPlay(this)
    }
};
CloudVideo.GetConformVideo = function(category, page) {
    if (category !== null) {
        CloudVideo.GetConformVideo.category = CloudVideo.CategoryJudge(category)
    }
    CloudMain.Ajax({
       
        url:"/service/video/Classify",
        
        data: {
            data: CloudVideo.GetConformVideo.category,
            page: page
        },
        success: function(rs) {
            var videoList = null;
            var cover, author, title, time, playInfo, playUrl, tag, category, description, videoId;
            if (!page) {
                CloudVideo.PlayRightContent.innerHTML = ''
            }
            if (CloudVideo.PlayRightContent.childNodes.length < 150) {
                CloudVideo.GetConformVideo.Next = rs.nextPageUrl ? rs.nextPageUrl.split('?')[1] : null
            } else {
                CloudVideo.GetConformVideo.Next = null;
                return false
            }
            rs = rs.itemList;
            for (var i = 0; i < rs.length; i++) {
                if (rs[i].type !== "textCard") {
                    videoList = rs[i].type === 'videoSmallCard' ? rs[i].data : rs[i].data.content.data;
                    cover = videoList.cover.detail;
                    author = videoList.author;
                    title = videoList.title;
                    time = videoList.duration;
                    playInfo = videoList.playInfo;
                    playUrl = videoList.playUrl;
                    tag = videoList.tags;
                    category = videoList.category;
                    description = videoList.description;
                    videoId = videoList.id;
                    CloudVideo.PrintConformVideo(cover, author, title, time, playInfo, playUrl, tag, category, description, videoId)
                }
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {}
    })
};
CloudVideo.PrintConformVideo = function(cover, author, title, time, playInfo, playUrl, tag, category, description, videoId) {
    var a = $.CreateElement({
        tag: "li",
        node: CloudVideo.PlayRightContent
    });
    a.data = {
        "videoId": videoId,
        "cover": cover,
        "title": title,
        "time": time,
        "author": author,
        "description": description,
        "playInfo": playInfo,
        "playUrl": playUrl,
        "category": category,
        "tags": tag
    };
    $.CreateElement({
        tag: "img",
        attr: {
            "src": cover
        },
        node: a
    });
    $.CreateElement({
        tag: "p",
        html: title,
        node: a
    });
    $.CreateElement({
        tag: "span",
        html: $.Time.sDeal(time),
        node: a
    });
    a.onclick = function() {
        if (CloudVideo.PlayControl.Player.src === this.data.playUrl) {
            return false
        };
        var a = CloudVideo.PlayRightContent.getElementsByTagName('li');
        for (var i = 0; i < a.length; i++) {
            a[i].className = ''
        }
        this.className = 'CloudVideoPlayRighActive';
        CloudVideo.PreparPlay(this, true)
    }
};
CloudVideo.GetVideoComment = function(videoId, page) {
    if (!page) {
        CloudVideo.VideoCommentArea.innerHTML = CloudVideo.Loading
    }
    CloudVideo.GetVideoComment.Next = null;
    CloudMain.Ajax({
        url:"/service/video/Comment",
        data: {
            data: videoId,
            page: page
        },
        success: function(rs) {
            CloudVideo.GetVideoComment.Next = rs.nextPageUrl ? rs.nextPageUrl.split('?')[1] : null;
            rs = rs.itemList;
            if (!page) {
                CloudVideo.VideoCommentArea.innerHTML = ''
            }
            if (!rs.length) {
                $.CreateElement({
                    tag: "p",
                    className: 'CloudVideoCommentTitle',
                    html: '没有评论',
                    node: CloudVideo.VideoCommentArea
                })
            }
            for (var i = 0; i < rs.length; i++) {
                if (rs[i].type === "leftAlignTextHeader") {
                    $.CreateElement({
                        tag: "p",
                        className: 'CloudVideoCommentTitle',
                        html: rs[i].data.text,
                        node: CloudVideo.VideoCommentArea
                    })
                }
                if (rs[i].type === "reply") {
                    var a = $.CreateElement({
                        className: 'CloudVideoCommentList',
                        node: CloudVideo.VideoCommentArea
                    });
                    $.CreateElement({
                        tag: 'img',
                        attr: {
                            "src": rs[i].data.user.avatar
                        },
                        node: a
                    });
                    $.CreateElement({
                        tag: 'span',
                        html: rs[i].data.user.nickname,
                        node: a
                    });
                    $.CreateElement({
                        tag: 'span',
                        className: 'CloudVideoCommentLike sf-icon-thumbs-up',
                        html: '&nbsp&nbsp' + rs[i].data.likeCount,
                        node: a
                    });
                    $.CreateElement({
                        tag: 'p',
                        html: rs[i].data.message,
                        node: a
                    });
                    $.CreateElement({
                        className: 'CloudVideoCommentTime',
                        html: $.Time.msToDate(rs[i].data.createTime),
                        node: a
                    })
                }
            }
        }
    })
};
CloudVideo.PreparPlay = function(this_video, flag) {
    CloudVideo.BackTop.click();
    CloudVideo.PlayControl.Start(this_video);
    CloudVideo.PlayControl.VideoTags.innerHTML = CloudVideo.PlayControl.DistinctList.innerHTML = '';
    if (this_video.data.author.icon && this_video.data.author.name) {
        CloudVideo.PlayControl.AuthorInfo[0].src = this_video.data.author.icon;
        CloudVideo.PlayControl.AuthorInfo[1].innerHTML = this_video.data.author.name
    }
    CloudVideo.PlayControl.AuthorInfo[2].innerHTML = this_video.data.description;
    CloudVideo.MainSwitch[2].click();
    CloudVideo.PlayControl.Times.setAttribute('data', 1);
    CloudVideo.PlayControl.Times.innerHTML = '1X';
    var a = $.CreateElement({
        tag: "li",
        html: '默认',
        node: CloudVideo.PlayControl.DistinctList
    });
    a.data = {
        "playUrl": this_video.data.playUrl
    };
    var playInfo = this_video.data.playInfo;
    var tags = this_video.data.tags;
    for (var i = 0; i < playInfo.length; i++) {
        a = $.CreateElement({
            tag: "li",
            html: playInfo[i].name,
            node: CloudVideo.PlayControl.DistinctList
        });
        a.data = {
            "playUrl": playInfo[i].url
        }
    }
    var li = CloudVideo.PlayControl.DistinctList.getElementsByTagName('li');
    for (i = 0; i < li.length; i++) {
        (function(i) {
            li[i].onclick = function() {
                var time = CloudVideo.PlayControl.Player.currentTime;
                CloudVideo.PlayControl.Player.src = this.data.playUrl;
                CloudVideo.PlayControl.Player.currentTime = time;
                CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-pause';
                CloudVideo.PlayControl.Player.play();
                CloudVideo.PlayControl.NowDistinct.innerHTML = this.innerHTML;
                CloudVideo.PlayControl.DistinctList.style.display = 'none'
            }
        })(i)
    }
    for (i = 0; i < tags.length; i++) {
        var a = $.CreateElement({
            html: tags[i].name,
            id: tags[i].id,
            node: CloudVideo.PlayControl.VideoTags
        });
        a.onclick = function() {
            CloudVideo.PlayControl.showTag();
            CloudVideo.SubTagData.start(this.id)
        }
    }
    if (!flag) {
        CloudVideo.PlayRightContent.innerHTML = CloudVideo.Loading;
        CloudVideo.GetConformVideo(this_video.data.category)
    }
    CloudVideo.GetVideoComment(this_video.data.videoId, 0)
};
CloudVideo.SubTagData = function() {
    CloudVideo.SubTagData.Head = $(".CloudVideoTagHead *");
    CloudVideo.SubTagData.start = function(id) {
        CloudMain.Ajax({
            url:"/service/video/SubByTag",
            data: {
                data: id
            },
            success: function(rs) {
                var info = rs.tagInfo;
                CloudVideo.TagSwitch[0].click();
                CloudVideo.SubTagData.Load('video', id, 0);
                CloudVideo.SubTagData.Load('dynamics', id, 0);
                CloudVideo.SubTagData.Head[1].innerHTML = info.name;
                CloudVideo.SubTagData.Head[2].innerHTML = info.tagVideoCount + '视频/' + info.tagFollowCount + '关注者/' + info.tagDynamicCount + '动态'
            }
        })
    };
    CloudVideo.SubTagData.Load = function(type, id, page) {
        var node = null,
            url = null;
        if (type === 'video') {
            node = CloudVideo.TagSwitchContainer[0];
            url = 'TagVideo'
        } else {
            node = CloudVideo.TagSwitchContainer[1];
            url = 'TagDynamics'
        }
        if (page === 0) {
            node.innerHTML = CloudVideo.Loading
        }
        CloudVideo.SubTagData.Load[type] = null;
        CloudMain.Ajax({
            url:"/service/video/" + url,
            data: {
                data: id,
                page: page
            },
            success: function(rs) {
                if (page === 0) {
                    node.innerHTML = ''
                }
                if (type === 'video') {
                    var videoList = rs.itemList;
                    var cover, author, title, time, playInfo, playUrl, tag, category, description, videoId;
                    for (var i = 0; i < videoList.length; i++) {
                        cover = videoList[i].data.content.data.cover.detail;
                        author = videoList[i].data.content.data.author;
                        title = videoList[i].data.content.data.title;
                        time = videoList[i].data.content.data.duration;
                        playInfo = videoList[i].data.content.data.playInfo;
                        playUrl = videoList[i].data.content.data.playUrl;
                        tag = videoList[i].data.content.data.tags;
                        category = videoList[i].data.content.data.category;
                        description = videoList[i].data.content.data.description;
                        videoId = videoList[i].data.content.data.id;
                        CloudVideo.PrintRecommend(cover, author, title, time, playInfo, playUrl, tag, category, description, videoId, node)
                    }
                } else {
                    var dynamicsList = rs.itemList;
                    var username, userhead, replytime, message, tag, cover, title, time, playUrl, category, description, videoId;
                    for (var i = 0; i < dynamicsList.length; i++) {
                        username = dynamicsList[i].data.user.nickname;
                        userhead = dynamicsList[i].data.user.avatar;
                        replytime = dynamicsList[i].data.createDate;
                        message = dynamicsList[i].data.reply.message;
                        tag = dynamicsList[i].data.text;
                        cover = dynamicsList[i].data.simpleVideo.cover.detail;
                        category = dynamicsList[i].data.simpleVideo.category;
                        videoId = dynamicsList[i].data.simpleVideo.id;
                        playUrl = dynamicsList[i].data.simpleVideo.playUrl;
                        time = dynamicsList[i].data.simpleVideo.duration;
                        description = dynamicsList[i].data.simpleVideo.description;
                        title = dynamicsList[i].data.simpleVideo.title;
                        CloudVideo.SubTagData.PrintDynamics(username, userhead, replytime, message, tag, cover, title, time, playUrl, category, description, videoId)
                    }
                }
                CloudVideo.SubTagData.Load[type] = rs.nextPageUrl ? rs.nextPageUrl.split('?')[1] : null;
                if (CloudVideo.SubTagData.Load[type] === null) {
                    if (type === 'video') {
                        $.CreateElement({
                            className: 'CloudVideoList',
                            style: {
                                "background": 'rgb(81, 81, 81)',
                                'text-align': "center",
                                "color": "#fff",
                                "line-height": "150px"
                            },
                            html: '已经没有更多内容了',
                            node: node
                        })
                    } else {}
                }
            }
        })
    };
    CloudVideo.SubTagData.PrintDynamics = function(username, userhead, replytime, message, tag, cover, title, time, playUrl, category, description, videoId) {
        var a = $.CreateElement({
            className: "CloudVideoDynamics",
            node: CloudVideo.TagSwitchContainer[1]
        });
        $.CreateElement({
            tag: "img",
            attr: {
                "src": userhead
            },
            node: a
        });
        $.CreateElement({
            tag: "span",
            html: username,
            node: a
        });
        $.CreateElement({
            tag: "span",
            className: 'CloudVideoDynamicsType',
            html: tag,
            node: a
        });
        var b = $.CreateElement({
            className: 'CloudVideoDynamicsMessage',
            html: '<span>' + message + '</span>',
            node: a
        });
        var c = $.CreateElement({
            className: 'CloudVideoDynamicsVideo',
            style: {
                "background": "url(" + cover + ")"
            },
            node: b
        });
        $.CreateElement({
            tag: "p",
            html: title,
            node: c
        });
        c.data = {
            "videoId": videoId,
            "cover": cover,
            "title": title,
            "time": time,
            "author": [],
            "description": description,
            "playInfo": [],
            "playUrl": playUrl,
            "category": category,
            "tags": []
        };
        c.onclick = function() {
            CloudVideo.PreparPlay(this)
        }
    }
};
CloudVideo.CategoryJudge = function(key) {
    var result = 0;
    switch (key) {
        case "创意":
            result = '02';
            break;
        case "开胃":
            result = '04';
            break;
        case "旅行":
            result = '06';
            break;
        case "预告":
            result = '08';
            break;
        case "动画":
            result = '10';
            break;
        case "剧情":
            result = '12';
            break;
        case "广告":
            result = '14';
            break;
        case "运动":
            result = '18';
            break;
        case "音乐":
            result = '20';
            break;
        case "记录":
            result = '22';
            break;
        case "时尚":
            result = '24';
            break;
        case "萌宠":
            result = '26';
            break;
        case "搞笑":
            result = '28';
            break;
        case "游戏":
            result = '30';
            break;
        case "科普":
            result = '32';
            break;
        case "集锦":
            result = '34';
            break;
        case "生活":
            result = '36';
            break;
        case "综艺":
            result = '38';
            break
    }
    return result
};
CloudVideo.PlayControl = function() {
    CloudVideo.PlayControl.TimeOut = null;
    CloudVideo.PlayControl.FullFlag = false;
    CloudVideo.PlayControl.Area = $(".CloudVideoPlayContainer");
    CloudVideo.PlayControl.Player = $(".CloudVideoPlayer")[0];
    CloudVideo.PlayControl.Main = CloudVideo.PlayControl.Player.parentNode;
    CloudVideo.PlayControl.Control = $(".CloudVideoPCLeft *");
    CloudVideo.PlayControl.ControlBar = $(".CloudVideoPlayControlContainer")[0];
    CloudVideo.PlayControl.AuthorInfo = $(".CloudVideoAuthor *");
    CloudVideo.PlayControl.VideoTags = $(".CloudVideoTags")[0];
    CloudVideo.PlayControl.PlayBtn = CloudVideo.PlayControl.Control[0];
    CloudVideo.PlayControl.StopBtn = CloudVideo.PlayControl.Control[1];
    CloudVideo.PlayControl.PlayerTime = CloudVideo.PlayControl.Control[2];
    CloudVideo.PlayControl.Slider = $(".CloudVideoPCSlider")[0];
    CloudVideo.PlayControl.TmpSlider = $(".CloudVideoPCTmpSlider")[0];
    CloudVideo.PlayControl.VolumnContainer = $(".CloudVideoVolumnContainer")[0];
    CloudVideo.PlayControl.Control = $(".CloudVideoPCRight *");
    CloudVideo.PlayControl.NowDistinct = CloudVideo.PlayControl.Control[0];
    CloudVideo.PlayControl.DistinctList = $(".CloudVideoDistinctList")[0];
    CloudVideo.PlayControl.Times = CloudVideo.PlayControl.Control[1];
    CloudVideo.PlayControl.FullBtn = CloudVideo.PlayControl.Control[5];
    CloudVideo.PlayControl.DownloadBtn = $("#CloudVideoDownLoad")[0];
    CloudVideo.PlayControl.DownloadBtn.onclick = function() {
        $.Request.download(CloudVideo.PlayControl.Player.src);
    };
    CloudVideo.PlayControl.Title = $(".CloudVideoPlayingTitle")[0];
    CloudVideo.PlayControl.Player.addEventListener("ended", function() {
        CloudVideo.PlayControl.StopBtn.click()
    });
    CloudVideo.PlayControl.Player.addEventListener("loadedmetadata", function() {
        setInterval(function() {
            var widthline = Math.round(CloudVideo.PlayControl.Player.currentTime) / Math.round(CloudVideo.PlayControl.Player.duration) * 100;
            CloudVideo.PlayControl.Slider.style.width = widthline + "%"
        }, 500)
    });
    CloudVideo.PlayControl.Player.addEventListener("progress", function() {
        try {
            var timeBuffered = CloudVideo.PlayControl.Player.buffered.end(CloudVideo.PlayControl.Player.buffered.length - 1);
            CloudVideo.PlayControl.TmpSlider.style.width = (timeBuffered / CloudVideo.PlayControl.Player.duration).toFixed(2) * 100 + '%'
        } catch (e) {}
    });
    CloudVideo.PlayControl.Player.addEventListener("timeupdate", function() {
        if ((Math.round(CloudVideo.PlayControl.Player.currentTime) / Math.round(CloudVideo.PlayControl.Player.duration) * 100) > 0) {
            CloudVideo.PlayControl.PlayerTime.innerHTML = $.Time.sDeal(CloudVideo.PlayControl.Player.currentTime) + '/' + $.Time.sDeal(CloudVideo.PlayControl.Player.duration)
        } else {
            CloudVideo.PlayControl.PlayerTime.innerHTML = '00:00/00:00'
        }
    });
    CloudVideo.PlayControl.Player.addEventListener("durationchange", function() {
        CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-play'
    });
    CloudVideo.PlayControl.Player.addEventListener("seeking", function() {
        CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-circle-notch sf-spin'
    });
    CloudVideo.PlayControl.Player.addEventListener("canplay", function() {
        if (CloudVideo.PlayControl.Player.paused) {
            CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-play'
        } else {
            CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-pause'
        }
    });
    CloudVideo.PlayControl.Player.onmousedown = function(e) {
        e.preventDefault();
        var startX = e.pageX;
        var startY = e.pageY;
        document.onmousemove = function(e) {
            var center_x = CloudVideo.PlayControl.Player.offsetLeft;
            var center_y = CloudVideo.PlayControl.Player.offsetTop;
            var isl = e.pageX - startX + center_x,
                ist = e.pageY - startY + center_y;
            if (isl < 0 || ist < 0) {
                document.onmousemove = null;
                CloudVideo.PlayControl.Player.style.left = '520px';
                CloudVideo.PlayControl.Player.style.top = '300px';
                return
            }
            CloudVideo.PlayControl.Player.style.left = isl + 'px';
            CloudVideo.PlayControl.Player.style.top = ist + 'px';
            startX = e.pageX;
            startY = e.pageY;
            document.onmouseup = new Function('this.onmousemove=null')
        };
        document.onmouseup = new Function('this.onmousemove=null')
    };
    CloudVideo.PlayControl.Slider.parentNode.onmousedown = function(e) {
        $.MediaControl(CloudVideo.PlayControl.Player, 'play', 'x', this, e)
    };
    CloudVideo.PlayControl.VolumnContainer.onmousedown = function(e) {
        $.MediaControl(CloudVideo.PlayControl.Player, 'volunmn', 'x', this, e)
    };
    CloudVideo.PlayControl.Area.onmousewheel = function() {
        if (this.scrollTop >= 150) {}
    };
    CloudVideo.PlayControl.Main.addEventListener("fullscreenchange", function(e) {
        CloudVideo.PlayControl.isFull(e)
    });
    CloudVideo.PlayControl.Main.addEventListener("mozfullscreenchange", function(e) {
        CloudVideo.PlayControl.isFull(e)
    });
    CloudVideo.PlayControl.Main.addEventListener("webkitfullscreenchange", function(e) {
        CloudVideo.PlayControl.isFull(e)
    });
    CloudVideo.PlayControl.Main.addEventListener("msfullscreenchange", function(e) {
        CloudVideo.PlayControl.isFull(e)
    });
    CloudVideo.PlayControl.Start = function(this_video) {
        CloudVideo.PlayControl.showPlay();
        CloudVideo.PlayControl.Player.src = this_video.data.playUrl;
        CloudVideo.PlayControl.Title.innerHTML = '[' + this_video.data.category + ']' + this_video.data.title;
        if (CloudVideo.PlayControl.Player.paused) {
            CloudVideo.PlayControl.PlayBtn.click()
        }
    };
    CloudVideo.PlayControl.NowDistinct.onclick = function() {
        if (!CloudVideo.PlayControl.DistinctList.offsetWidth) {
            CloudVideo.PlayControl.DistinctList.parentNode.style.position = 'relative';
            CloudVideo.PlayControl.DistinctList.style.display = 'block'
        } else {
            CloudVideo.PlayControl.DistinctList.parentNode.removeAttribute('style');
            CloudVideo.PlayControl.DistinctList.style.display = 'none'
        }
    };
    CloudVideo.PlayControl.Player.onclick = CloudVideo.PlayControl.PlayBtn.onclick = function() {
        if (CloudVideo.PlayControl.Player.paused) {
            CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-pause';
            CloudVideo.PlayControl.Player.play()
        } else {
            CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-play';
            CloudVideo.PlayControl.Player.pause()
        }
        CloudVideo.PlayControl.DistinctList.parentNode.removeAttribute('style');
        CloudVideo.PlayControl.DistinctList.style.display = 'none'
    };
    CloudVideo.PlayControl.StopBtn.onclick = function() {
        CloudVideo.PlayControl.Player.currentTime = 0;
        CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-play';
        CloudVideo.PlayControl.Player.pause()
    };
    CloudVideo.PlayControl.Times.onclick = function() {
        var state = this.getAttribute('data'),
            turn = 1.0;
        if (state === '1') {
            turn = 1.2
        } else if (state === '1.2') {
            turn = 1.5
        } else if (state === '1.5') {
            turn = 2.0
        } else if (state === '2.0') {
            turn = 1.0
        }
        this.innerHTML = turn + 'X';
        this.setAttribute("data", turn);
        CloudVideo.PlayControl.Player.playbackRate = turn
    };
    CloudVideo.PlayControl.FullBtn.onclick = function() {
        var b = CloudVideo.PlayControl.Main;
        if ((b.requestFullscreen || b.mozRequestFullScreen || b.webkitRequestFullScreen || b.msRequestFullscreen) && b.offsetHeight !== window.innerHeight) {
            b.requestFullscreen ? b.requestFullscreen() : b.mozRequestFullScreen ? b.mozRequestFullScreen() : b.webkitRequestFullScreen ? b.webkitRequestFullScreen() : b.msRequestFullscreen ? b.msRequestFullscreen() : ""
        } else if (document.exitFullscreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen) {
            document.exitFullscreen ? document.exitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen ? document.webkitCancelFullScreen() : document.msExitFullscreen ? document.msExitFullscreen() : ""
        }
    };
    CloudVideo.PlayControl.ShowInit = function() {
        for (var i = 0; i < CloudVideo.PlayControl.Area.length; i++) {
            CloudVideo.PlayControl.Area[i].style.display = 'none'
        }
        CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-play';
        CloudVideo.PlayControl.Player.pause();
        CloudVideo.BackTop.click()
    };
    CloudVideo.PlayControl.showPlay = function() {
        for (var i = 0; i < CloudVideo.PlayControl.Area.length; i++) {
            CloudVideo.PlayControl.Area[i].style.display = 'none'
        }
        CloudVideo.PlayControl.Area[0].style.display = 'block'
    };
    CloudVideo.PlayControl.showAuthor = function() {
        CloudVideo.PlayControl.ShowInit();
        CloudVideo.PlayControl.Area[1].style.display = 'block'
    };
    CloudVideo.PlayControl.showTag = function() {
        CloudVideo.PlayControl.ShowInit();
        CloudVideo.PlayControl.Area[2].style.display = 'block'
    };
    CloudVideo.PlayControl.isFull = function() {
        if (CloudVideo.PlayControl.Main.offsetHeight !== window.innerHeight) {
            CloudVideo.PlayControl.FullFlag = false;
            CloudVideo.PlayControl.ControlBar.onmouseover = null;
            CloudVideo.PlayControl.ControlBar.onmouseout = null;
            CloudVideo.PlayControl.ControlBar.style.opacity = '1';
            CloudVideo.PlayControl.ControlBar.style.top = '0px';
            clearTimeout(CloudVideo.PlayControl.TimeOut)
        } else {
            CloudVideo.PlayControl.ControlBar.style.top = '-50px';
            CloudVideo.PlayControl.FullFlag = true;
            CloudVideo.PlayControl.TimeOut = setTimeout(function() {
                CloudVideo.PlayControl.ControlBar.style.opacity = '0';
                clearTimeout(CloudVideo.PlayControl.TimeOut)
            }, 5000);
            CloudVideo.PlayControl.ControlBar.onmouseover = function() {
                CloudVideo.PlayControl.ControlBar.style.opacity = '1';
                clearTimeout(CloudVideo.PlayControl.TimeOut)
            };
            CloudVideo.PlayControl.ControlBar.onmouseout = function() {
                CloudVideo.PlayControl.TimeOut = setTimeout(function() {
                    if (CloudVideo.PlayControl.FullFlag) {
                        CloudVideo.PlayControl.ControlBar.style.opacity = '0'
                    }
                }, 4000)
            }
        }
    }
};
CloudVideo.GetHotKey = function() {
    CloudMain.Ajax({
        url:"/service/video/Queries",
        success: function(rs) {
            CloudVideo.Search.HotKey = rs;
            for (var i = 0; i < rs.length; i++) {
                CloudVideo.PrintHotKey(rs[i])
            }
        }
    })
};
CloudVideo.PrintHotKey = function(name) {
    var a = $.CreateElement({
        className: 'CloudVideoSearchKey',
        html: name,
        node: CloudVideo.Search.Main
    });
    a.onclick = function() {
        CloudVideo.Search.Input.value = this.innerHTML;
        CloudVideo.Search.Start(0)
    }
};
CloudVideo.GetClassify = function(key, page) {
    var key=key;
    if (key !== null) {
        CloudVideo.GetClassify.data = CloudVideo.CategoryJudge(key)
    }
    if (page === 0) {
        CloudVideo.ClassifyMain.innerHTML = CloudVideo.Loading
    }
    CloudVideo.GetClassify.Next = null;
    CloudMain.Ajax({
        url:"/service/video/Classify",
        data: {
            data: CloudVideo.GetClassify.data,
            page: page
        },
        success: function(rs) {
            var videoList = null;
            var cover, author, title, time, playInfo, playUrl, tag, category, description, videoId;
            if (page === 0) {
                CloudVideo.ClassifyMain.innerHTML = ''
            }
            CloudVideo.GetClassify.Next = rs.nextPageUrl ? rs.nextPageUrl.split('?')[1] : null;
            rs = rs.itemList;
            for (var i = 0; i < rs.length; i++) {
                if (rs[i].type !== "textCard") {
                    videoList = rs[i].type === 'videoSmallCard' ? rs[i].data : rs[i].data.content.data;
                    cover = videoList.cover.detail;
                    author = videoList.author;
                    title = videoList.title;
                    time = videoList.duration;
                    playInfo = videoList.playInfo;
                    playUrl = videoList.playUrl;
                    tag = videoList.tags;
                    category = videoList.category;
                    description = videoList.description;
                    videoId = videoList.id;
                    CloudVideo.PrintRecommend(cover, author, title, time, playInfo, playUrl, tag, category, description, videoId, CloudVideo.ClassifyMain)
                }
            }
            if (CloudVideo.ClassifyMain.offsetHeight===CloudVideo.ClassifyMain.scrollHeight&&CloudVideo.GetClassify.Next) {
                CloudVideo.GetClassify(key,CloudVideo.GetClassify.Next)
            }
        }
    })
};
CloudVideo.Search = function() {
    CloudVideo.Search.HotKey = [];
    CloudVideo.Search.Next = null;
    CloudVideo.Search.Head = $(".CloudVideoSearchHead p")[0];
    CloudVideo.Search.Main = $(".CloudVideoSearchMain")[0];
    CloudVideo.Search.Input = $("#CloudVideoSearch")[0];
    CloudVideo.Search.Input.onkeyup = function() {
        if (this.value.length) {
            CloudVideo.Search.Main.innerHTML = ''
        } else {
            if (!CloudVideo.Search.Main.innerHTML) {
                for (var i = 0; i < CloudVideo.Search.HotKey.length; i++) {
                    CloudVideo.PrintHotKey(CloudVideo.Search.HotKey[i])
                }
            }
            CloudVideo.Search.Head.innerHTML = ''
        }
    };
    CloudVideo.Search.Input.onkeydown = function(e) {
        if (e.keyCode === 13) {
            if (this.value.length) {
                CloudVideo.Search.Start(0)
            } else {
                $.Toast('请输入关键词');
                CloudVideo.Search.Head.innerHTML = ''
            }
        }
    };
    CloudVideo.Search.Main.onmousewheel = function() {
        if (this.scrollTop + this.offsetHeight >= this.scrollHeight - 32) {
            if (CloudVideo.Search.Next) {
                CloudVideo.Search.Start(CloudVideo.Search.Next)
            }
        }
    };
    CloudVideo.Search.Start = function(page) {
        if (page === 0) {
            CloudVideo.Search.Main.innerHTML = CloudVideo.Loading
        }
        CloudVideo.Search.Next = null;
        CloudMain.Ajax({
            url:"/service/video/Search",
            data: {
                data: CloudVideo.Search.Input.value,
                page: page
            },
            success: function (rs) {
                if (page === 0) {
                    CloudVideo.Search.Count = 0;
                    CloudVideo.Search.Main.innerHTML = ''
                }
                var videoList = rs.itemList;
                var cover, author, title, time, playInfo, playUrl, tag, category, description, videoId;
                for (var i = 0; i < videoList.length; i++) {
                    if (videoList[i].type === 'video') {
                        cover = videoList[i].data.cover.detail;
                        author = videoList[i].data.author;
                        title = videoList[i].data.title;
                        time = videoList[i].data.duration;
                        playInfo = videoList[i].data.playInfo;
                        playUrl = videoList[i].data.playUrl;
                        tag = videoList[i].data.tags;
                        category = videoList[i].data.category;
                        description = videoList[i].data.description;
                        videoId = videoList[i].data.id;
                        CloudVideo.PrintRecommend(cover, author, title, time, playInfo, playUrl, tag, category, description, videoId, CloudVideo.Search.Main)
                    }
                    if (videoList[i].type === 'videoCollectionWithBrief') {
                        videoList[i] = videoList[i].data.itemList;
                        for (var j = 0; j < videoList[i].length; j++) {
                            cover = videoList[i][j].data.cover.detail;
                            author = videoList[i][j].data.author;
                            title = videoList[i][j].data.title;
                            time = videoList[i][j].data.duration;
                            playInfo = videoList[i][j].data.playInfo;
                            playUrl = videoList[i][j].data.playUrl;
                            tag = videoList[i][j].data.tags;
                            category = videoList[i][j].data.category;
                            description = videoList[i][j].data.description;
                            videoId = videoList[i][j].data.id;
                            CloudVideo.Search.Count++;
                            CloudVideo.PrintRecommend(cover, author, title, time, playInfo, playUrl, tag, category, description, videoId, CloudVideo.Search.Main)
                        }
                    }
                    CloudVideo.Search.Count++
                }
                CloudVideo.Search.Next = rs.nextPageUrl ? rs.nextPageUrl.split('?')[1] : null;
                CloudVideo.Search.Head.innerHTML = '共找到' + rs.total + '条记录，已显示' + CloudVideo.Search.Count + '条'
            }
        });
    };
    CloudVideo.GetHotKey();
};
CloudVideo.Init = function() {
    $(".CloudVideoHead img")[0].src='public/img/bar/'+($.Cookie.get('themes')||CloudMain.User.theme)+'/video.png';
    CloudVideo.Main = $(".CloudVideoMain")[0];
    CloudVideo.MainSwitch = $(".CloudVideoHead li");
    CloudVideo.MainContainer = $(".CloudVideoContent");
    CloudVideo.MainClassifySwitch = $(".CloudVideoNormalClassify li");
    CloudVideo.MainClassifyContainer = $(".CloudVideoContentRight");
    CloudVideo.ClassifySwitch = $(".CloudVideoAllClassify li");
    CloudVideo.AllClassifyContainer = $(".CloudVideoAllClassifyContainer")[0];
    CloudVideo.ClassifyHead = $(".CloudVideoAllClassifyHead")[0];
    CloudVideo.ClassifyMain = $(".CloudVideoAllClassifyMain")[0];
    CloudVideo.PlayRightContent = $(".CloudVideoPlayRightContent")[0];
    CloudVideo.VideoCommentArea = $(".CloudVideoComment")[1];
    CloudVideo.SendCommentArea = $("#CloudVideoSendComment *");
    CloudVideo.TagSwitch = $(".CloudVideoTagSwitch *");
    CloudVideo.TagSwitchContainer = $(".CloudVideoTagContainer");
    CloudVideo.Loading = "<span class='CloudVideoLoading'></span>";
    CloudVideo.BackTop = $(".CloudVideoBackTop")[0];
    for (var i = 0; i < CloudVideo.MainSwitch.length; i++) {
        (function(i) {
            CloudVideo.MainSwitch[i].onclick = function() {
                for (var j = 0; j < CloudVideo.MainSwitch.length; j++) {
                    CloudVideo.MainSwitch[j].getElementsByTagName('div')[0].style.width = '0%';
                    CloudVideo.MainContainer[j].style.display = 'none'
                }
                if (i === 2) {
                    CloudVideo.MainSwitch[i].removeAttribute('style');
                    CloudVideo.PlayControl.showPlay()
                } else {
                    CloudVideo.PlayControl.Player.pause();
                    CloudVideo.PlayControl.PlayBtn.className = 'sf-icon-play'
                }
                CloudVideo.MainSwitch[i].getElementsByTagName('div')[0].style.width = '100%';
                CloudVideo.MainContainer[i].style.display = 'block'
            }
        })(i)
    }
    for (i = 0; i < CloudVideo.MainClassifySwitch.length; i++) {
        (function(i) {
            CloudVideo.MainClassifySwitch[i].onclick = function() {
                for (var j = 0; j < CloudVideo.MainClassifySwitch.length; j++) {
                    CloudVideo.MainClassifySwitch[j].className = '';
                    CloudVideo.MainClassifyContainer[j].style.display = 'none'
                }
                for (j = 0; j < CloudVideo.ClassifySwitch.length; j++) {
                    CloudVideo.ClassifySwitch[j].className = ''
                }
                CloudVideo.AllClassifyContainer.style.display = 'none';
                CloudVideo.MainClassifySwitch[i].className = 'CloudVideoActive';
                CloudVideo.MainClassifyContainer[i].style.display = 'block'
            }
        })(i)
    }
    for (i = 0; i < CloudVideo.ClassifySwitch.length; i++) {
        (function(i) {
            CloudVideo.ClassifySwitch[i].onclick = function() {
                for (var j = 0; j < CloudVideo.ClassifySwitch.length; j++) {
                    CloudVideo.ClassifySwitch[j].className = ''
                }
                for (j = 0; j < CloudVideo.MainClassifySwitch.length; j++) {
                    CloudVideo.MainClassifySwitch[j].className = '';
                    CloudVideo.MainClassifyContainer[j].style.display = 'none'
                }
                CloudVideo.GetClassify(CloudVideo.ClassifySwitch[i].innerHTML, 0);
                CloudVideo.ClassifyHead.innerHTML = CloudVideo.ClassifySwitch[i].innerHTML;
                CloudVideo.AllClassifyContainer.style.display = 'block';
                CloudVideo.ClassifySwitch[i].className = 'CloudVideoActive'
            }
        })(i)
    }
    for (i = 0; i < CloudVideo.TagSwitch.length; i++) {
        (function(i) {
            CloudVideo.TagSwitch[i].onclick = function() {
                for (j = 0; j < CloudVideo.TagSwitch.length; j++) {
                    CloudVideo.TagSwitch[j].className = '';
                    CloudVideo.TagSwitchContainer[j].style.display = 'none'
                }
                CloudVideo.TagSwitch[i].className = 'CloudVideoTagSwitchActive';
                CloudVideo.TagSwitchContainer[i].style.display = 'block'
            }
        })(i)
    }
    CloudVideo.RecommendPage = $("#CVRecommendPage")[0];
    CloudVideo.RecommendPage.onmousewheel = function() {
        if (this.scrollTop + this.offsetHeight >= this.scrollHeight - 32) {
            if (CloudVideo.GetRecommend.Next) {
                CloudVideo.GetRecommend(CloudVideo.GetRecommend.Next)
            }
        }
    };
    CloudVideo.PlayRightContent.onmousewheel = function() {
        if (this.scrollTop + this.offsetHeight >= this.scrollHeight - 32) {
            if (CloudVideo.GetConformVideo.Next) {
                CloudVideo.GetConformVideo(null, CloudVideo.GetConformVideo.Next)
            }
        }
    };
    CloudVideo.VideoCommentArea.onmousewheel = function() {
        if (this.scrollTop + this.offsetHeight >= this.scrollHeight - 32) {
            if (CloudVideo.GetVideoComment.Next) {
                CloudVideo.GetVideoComment(null, CloudVideo.GetVideoComment.Next)
            }
        }
    };
    CloudVideo.TagSwitchContainer[0].onmousewheel = function() {
        if (this.scrollTop + this.offsetHeight >= this.scrollHeight - 32) {
            if (CloudVideo.SubTagData.Load.video) {
                CloudVideo.SubTagData.Load('video', null, CloudVideo.SubTagData.Load.video)
            }
        }
    };
    CloudVideo.TagSwitchContainer[1].onmousewheel = function() {
        if (this.scrollTop + this.offsetHeight >= this.scrollHeight - 32) {
            if (CloudVideo.SubTagData.Load.dynamics) {
                CloudVideo.SubTagData.Load('dynamics', null, CloudVideo.SubTagData.Load.dynamics)
            }
        }
    };
    CloudVideo.MainContainer[2].onmousewheel = function() {
        if (this.scrollTop > 200) {
            CloudVideo.BackTop.style.display = 'block';
            if (!CloudVideo.PlayControl.Player.getAttribute('style')) {
                CloudVideo.PlayControl.Player.parentNode.style.minHeight=CloudVideo.PlayControl.Player.offsetHeight+'px';
                CloudVideo.PlayControl.Player.style.position = 'absolute';
                CloudVideo.PlayControl.Player.style.width = '400px';
                CloudVideo.PlayControl.Player.style.height = '300px';
                CloudVideo.PlayControl.Player.style.left = '520px';
                CloudVideo.PlayControl.Player.style.top = '300px';
                CloudVideo.PlayControl.Player.style.cursor = 'move'
            }
        } else {
            CloudVideo.BackTop.style.display = 'none';
            CloudVideo.PlayControl.Player.removeAttribute('style');
            CloudVideo.PlayControl.Player.parentNode.removeAttribute('style');
        }
    };
    CloudVideo.MainContainer[2].tabIndex = -1;
    CloudVideo.MainContainer[2].focus();
    CloudVideo.MainContainer[2].onkeydown = function() {
        var e = window.event || arguments[0];
        if (e.keyCode === 32) {
            e.preventDefault();
            CloudVideo.PlayControl.Player.click()
        } else if (e.keyCode === 39) {
            e.preventDefault();
            CloudVideo.PlayControl.Player.currentTime = CloudVideo.PlayControl.Player.currentTime + 5
        } else if (e.keyCode === 37) {
            e.preventDefault();
            CloudVideo.PlayControl.Player.currentTime = CloudVideo.PlayControl.Player.currentTime - 5
        }
    };
    CloudVideo.ClassifyMain.onmousewheel = function() {
        if (this.scrollTop + this.offsetHeight >= this.scrollHeight - 32) {
            if (CloudVideo.GetClassify.Next) {
                CloudVideo.GetClassify(null, CloudVideo.GetClassify.Next)
            }
        }
    };
    CloudVideo.SendCommentArea[0].src = $.Cookie.get('userhead')||CloudMain.userhead;
    CloudVideo.SendCommentArea[1].innerHTML = $.Cookie.get('username')||CloudMain.username;
    CloudVideo.SendCommentArea[2].onfocus = function() {
        if (this.innerHTML === '写下你的牛评') {
            this.innerHTML = ''
        }
    };
    CloudVideo.SendCommentArea[2].onblur = function() {
        if (this.innerHTML === '') {
            this.innerHTML = '写下你的牛评'
        }
    };
    CloudVideo.SendCommentArea[2].onkeyup = function() {
        CloudVideo.SendCommentArea[3].innerHTML = $.String.length(this.value, false) + '/250'
    };
    CloudVideo.SendCommentArea[4].onclick = function() {
        if (!CloudVideo.SendCommentArea[2].value.length || CloudVideo.SendCommentArea[2].value === '写下你的牛评') {
            $.Toast('评论内容不能为空');
            return false
        }
        $.Toast('暂不可用')
    };
    CloudVideo.BackTop.onclick = function() {
        var timer = null;
        cancelAnimationFrame(timer);
        timer = requestAnimationFrame(function fn() {
            var oTop = CloudVideo.MainContainer[2].scrollTop;
            if (oTop > 0) {
                CloudVideo.MainContainer[2].scrollTop = CloudVideo.MainContainer[2].scrollTop = oTop - (oTop / 3);
                timer = requestAnimationFrame(fn)
            } else {
                cancelAnimationFrame(timer)
            }
            CloudVideo.MainContainer[2].onmousewheel()
        })
    };
    CloudVideo.GetRecommend(0);
    CloudVideo.PlayControl();
    CloudVideo.Search();
    CloudVideo.SubTagData()
}();