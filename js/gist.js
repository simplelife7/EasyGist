


var gist = {
  //EasyGist 申请得到的Client ID
  clientId: '3857057f570612453d8c',

  //弹出github验证窗口
  oauth: [
    function(callback) {
      gist.oauth.callback = callback;
      var popup = open('https://github.com/login/oauth/authorize' + '?client_id=' + gist.clientId + '&scope=gist,user', 'popup', 'width=960,height=500');
    },

    function(token) {
      if (token) {
        window.ACCESS_TOKEN = localStorage['access_token'] = token;

        gist.getUser(gist.oauth.callback);

      } else {
        alert('Authentication error');
      }

      gist.oauth.callback = null;
    }
  ],

  xhr: function(o) {
    document.body.setAttribute('data-loading', '');

    var xhr = new XMLHttpRequest(),
      method = o.method || 'GET',
      data = o.data || '';

    xhr.open(method, o.url + (method === 'GET' && data ? '?' + data : ''), true);

    if (method !== 'GET') {
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    if (o.headers) {
      for (var header in o.headers) {
        xhr.setRequestHeader(header, o.headers[header]);
      }
    }

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        document.body.removeAttribute('data-loading');

        if (xhr.responseText) {
          o.callback(xhr);
        }
      }
    };

    xhr.send(method === 'GET' ? null : data);

    return xhr;
  },


  request: function(o) {
    o.method = o.method || 'GET';
    o.id = o.id || '';
    o.rev = o.rev || '';

    var anon = o.anon || o.method === 'GET';

    if (!anon && !window.ACCESS_TOKEN) {
      gist.oauth[0](function() {
        gist.request(o);
      });
      return;
    }

    var path = o.path || 'gists' + (o.id ? '/' + o.id : '') + (o.rev ? '/' + o.rev : '') + (o.gpath || '');

    gist.xhr({
      method: o.method,
      url: 'https://api.github.com/' + path + (!o.anon && window.ACCESS_TOKEN ? '?access_token=' + ACCESS_TOKEN : ''),
      headers: o.headers,
      callback: function(xhr) {
        var data = JSON.parse(xhr.responseText);

        if (data.message) {
          alert('Sorry, I got a ' + xhr.status + ' (' + data.message + ')');
        } else {
          o.callback && o.callback(data, xhr);
        }
      },
      data: o.data ? JSON.stringify(o.data) : null
    });

  },

  //获取用户信息，赋于window.user
  getUser: function(callback) {
    gist.request({
      path: 'user',
      callback: function(data) {
        window.user = data;
        callback && callback(data);
        domAction.userInfo(data);
      }
    });
  },

  //获取Gist列表
  getGists: function(user) {
    gist.request({
      path: 'users/' + user.login + '/gists',
      callback: function(data) {
        console.log(typeof(data));
        if(data.length !== 0){
          domAction.gistList(data);
        }else{
          domAction.newer();
        }
        
      }
    });
  },

  //通过ID获取单个Gist信息
  getSingleGist: function(id) {
    gist.request({
      id: id,
      callback: function(data) {
        domAction.singleGist(data);
      }
    });
  },

  //获取单个Gist所包含的文件
  getSingleGistFiles: function(id) {
    gist.getSingleGist(id);
    console.log(gist.getSingleGist(id));
  },

  //获取所有gist标题，构造数组
  getGistDes: function() {

    gist.request({
      path: 'users/' + user.login + '/gists',
      callback: function(data) {
        var source = [];
        for (var p in data) {

          // source.push(data[p].description);
          var ea = data[p].description;
          var val = data[p].id;
          var str = {
            label: ea,
            value: val
          }
          source.push(str);
        };
        domAction.searchSuggest(source);
      }
    });

  },

  //更新Gist
  updateGist : function(id,title,files){
    gist.request({
      id: id,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8'
      },
      callback: function(data) {
        console.log(data);
        if(data){
          alert('Update this file succeed!');
        }else{
          alert('Update failed!')
        }
        
      },
      data: {
        "description": title,
        "public": true,
        "files": files
      }
    });
  },

  
  //删除Gist
  deleteGist : function(id){
    gist.request({
      path: 'gists/' + id,
      method: 'DELETE',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8'
      },
      callback: function(data) {
        console.log(data);
      }
    });
  },

  //创建Gist
  newGist : function(title,files,isPublic){
    var isPublic = (isPublic == 0 ) ? 'true' : "false";
    gist.request({
      path: 'gists',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8'
      },
      callback: function(data) {
        console.log(data);
        if(data){
          alert('Creat the new gist succeed!');
          location.href = 'http://lab.reeqi.name/easyGist/index.html';
        }else{
          alert('Creat failed!');
        }
        
      },
      data: {
        "description": title,
        "public": isPublic,
        "files": files
      }
    });    
  }
}