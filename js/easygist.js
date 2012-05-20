var easyGist = {

  //Easy Gist 版本号
  version: '1.0.0',

  user: {

    //登录验证，并实现
    login: function() {
      gist.oauth[0](function(user) {
        easyGist.user.afterLogin(user);
      });
    },

    //登录后获取Gist列表并侦听点击
    afterLogin: function(user) {
      gist.getGists(user);
      domAction.afterLoginListener();

      //获取全部gist名称，构造搜索建议数组
      gist.getGistDes();
    },

    //登出操作
    logout: function() {
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('access_token');
      }
    }
  }
};