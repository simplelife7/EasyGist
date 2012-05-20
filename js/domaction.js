var domAction = {

	//渲染用户信息相关的DOM结构
	userInfo: function(data) {
		var htmlTmp = $('#userDom').html(),
			userName = (data.name || data.login),
			userPic = data.avatar_url,
			UserLink = 'https://gist.github.com/' + data.login;
		htmlTmp = htmlTmp.replace(/{#userName#}/gi, userName).replace(/{#userPic#}/gi, userPic).replace(/{#userLink#}/gi, UserLink);
		$('#userInfo').html(htmlTmp);
	},

	//登录后时间侦听
	afterLoginListener : function(){
    $('#loginWrap').hide();
    $('h1').hide();
    $('#glistList').click(function(e) {
      if(e.target.nodeName !== 'A'){
        return false;
      }
      $('#glistList').hide();
      $('#singleList').show();
      e.preventDefault();
      var gistId = e.target.href.substr('https://gist.github.com/'.length);
      gist.getSingleGist(gistId);

    });

	},

	//渲染Gist列表
	gistList: function(data) {
		var htmlTmp = $('#gistListDom').html(),
			html = '';
		for (var p in data) {
			html += '<li><a href="' + data[p].html_url + '">' + data[p].description + '</a></li>';
		}
		htmlTmp = htmlTmp.replace('{#gistList#}', html);
		$('#glistList').html(htmlTmp);
	},

	//渲染单个Gist的DOM
	singleGist: function(data) {
		var htmlTmp = $('#singleGistDom').html(),
			gistTitle = data.description,
			editLink = 'https://gist.github.com/gists/' + data.id + '/edit';
			updateTime = data.history[0].committed_at,
			htmlUrl = data.html_url,
			isPublic = (data.public == true ? 'Public' : 'Private'),
			tabNavHtml = '',
			tabConHtml = '',
			files = [];
		for (var p in data.files) {
			files.push(data.files[p]);
		};
		console.log(files)
		for (var i = 0; i < files.length; i++) {
			if (i == 0) {
				tabNavHtml += '<li class="active"><a  data-toggle="tab" href="#con' + i + '">' + files[i].language + '</a></li>';
				tabConHtml += '<section class="tab-pane fade active in" id="con' + i + '"><h4>' + files[i].filename + '</h4><textarea class="input-xlarge"  id="codeWrap_' + i + '" rows="3">' + unescape(files[i].content) + '</textarea></section>';
			} else {
				tabNavHtml += '<li><a  data-toggle="tab" href="#con' + i + '">' + files[i].language + '</a></li>'
				tabConHtml += '<section class="tab-pane fade" id="con' + i + '"><h4>' + files[i].filename + '</h4><textarea class="input-xlarge"  id="codeWrap_' + i + '"  rows="3">' + unescape(files[i].content) + '</textarea></section>';
			}
		};

		htmlTmp = htmlTmp.replace('{#htmlUrl#}', htmlUrl).replace('{#editGistLink#}',editLink).replace('{#updateTime#}', updateTime).replace('{#isPublic#}', isPublic).replace('{#gistTitle#}', gistTitle).replace('{#tabNavHtml#}', tabNavHtml).replace('{#tabConHtml#}', tabConHtml);
		$('#singleList').html(htmlTmp);
		domAction.toBack();
		domAction.gistInfoPop();
		domAction.copyCode();
	},

	//搜索建议
	searchSuggest: function(resource) {
		console.log(resource);
		$('#search').typeahead({
			source: resource
		});
		$('#search').on('selected', function() {
			for (var i = 0; i < resource.length; i++) {
				if (resource[i]['label'] == this.value) {
					var gistId = resource[i].value;
				}
			};
			if ($('#glistList').css('display') == 'block' || $('#singleList').css('display') == 'none') {
				$('#glistList').hide();
				$('#singleList').show();
				gist.getSingleGist(gistId);
			} else {
				gist.getSingleGist(gistId);
			}
		})
	},

	//编辑单个文件
	editFiles : function(){
		var gistId = $('#getGistId').attr('href').substr('https://gist.github.com/'.length);
		var gistTitle = $('#getGistId').html();
		var fileTitles = $('#myTabContent h4'),
			fileCon = $('#myTabContent textarea');
		var str ='{';
		
		for(var i = 0 ; i < fileTitles.length; i++ ){
			var a = escape(fileTitles[i].innerHTML);
			var b = escape(fileCon[i].value);				
			if(i==0){
				str += '"' + a +'" :{ "content" : "' + b + '"}';
			}else{
				str += ',"' + a +'" :{ "content" : "' + b + '"}';
			}
		}
		str += '}';
		
		var files = eval("("+str+")");

		for(var p in files){
			files[p].content = unescape(files[p].content);
		}
		console.log(files);

		gist.updateGist(gistId,gistTitle,files);
		
	},

	//删除Gist
	deleteGist :function(){
		var gistId = $('#getGistId').attr('href').substr('https://gist.github.com/'.length);
		if(confirm("Are you sure to delete this gist？") == true){
			gist.deleteGist(gistId);
			setTimeout(function(){
				location.href = 'http://lab.reeqi.name/easyGist/index.html';
			},1000)
			//location.href = 'http://lab.reeqi.name/easyGist/index.html';
		}

	},

	//创建Gist
	createGist : function(isPublic){

		var isPublic = isPublic;
		var gistName = $('#gistName').val();
		//var fileName = $('#fileName').val();

		var filesNames = $('#newGistInfo input');
		var filesCons = $('#newGistInfo textarea');
		var expCheckName = /\.[^\.]+$/;

		for(var j = 0 ; j < filesNames.length ;j++){
			if(expCheckName.exec(filesNames[j].value)==null){
				alert("Please input the file extensions! example: index.html");
				return false;
			}
		}

		var str ='{';
		for(var i = 0 ; i < filesNames.length; i++ ){
			var a = escape(filesNames.eq(i).val());
			var b = escape(filesCons.eq(i).val());				
			if(i==0){
				str += '"' + a +'" :{ "content" : "' + b + '"}';
			}else{
				str += ',"' + a +'" :{ "content" : "' + b + '"}';
			}
		}
		str += '}';
		var files = eval("("+str+")");

		for(var p in files){
			files[p].content = unescape(files[p].content);
		}
		gist.newGist(gistName,files,isPublic);
	},


	//没有Gist的用户显示新建Gist提示
	newer : function(){
        $('#newer').show();
	},

	//返回列表
  toBack: function() {
    $('#toBack').click(function(e) {
      e.preventDefault();
      $('#glistList').show();
      $('#singleList').hide();
      $('#singleList').html('');
    });
  },

  //Gist 额外信息popup层
  gistInfoPop: function() {
    //alert($('#gistTitle').html())
    $('#gistTitle').tooltip({
      placement: 'right',
      trigger: 'hover'
    });
  },

  //拷贝代码相关逻辑
  copyCode: function() {
    var tabConLen = $('.tab-pane').length;
    $('#copy_button').zclip({
      path: 'js/ZeroClipboard.swf',
      copy: function() {
        for (i = 0; i < tabConLen; i++) {
          if ($('.tab-pane').eq(i).hasClass("active")) {
            return $('#codeWrap_' + i).val();
          }
        };
      },
      afterCopy: function() {
        alert("This file's code has copied to your clipboard !");
      }
    });

  },

  //创建Gist时删除文件输入框
  delFile : function(){
  	var newFiles = $('.new_files_area');
		var newFilesLength = $('.new_files_area').length;
		for(k=0 ;k < newFilesLength; k++){
  		(function(i){
    		$('.del_file').eq(i).click(function(){
      		newFiles.eq(i).remove();
    		})
  		})(k); 
  	}
  },

  //创建Gist事件侦听
  createGistListener : function(){
	  $('#newFile').bind('click',function(){
	    var newFileHtml = $('#newFileDom').html();
	    $('#newGistInfo').append(newFileHtml);
	    domAction.delFile();
	  });

	  $('#cPublicGist').bind('click',function(){
	    domAction.createGist(0);
	  });

	  $('#cPrivateGist').bind('click',function(){
	    domAction.createGist(1);
	  });  	
  }
}
