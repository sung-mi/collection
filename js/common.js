var userAgt = {
	name:navigator.userAgent.toLowerCase(),
	on:function(){
		$('html').attr('data-useragent',userAgt.name);
	},
	check:function(i){
		var na='';
		var msie = /msie|trident|edge/.test(userAgt.name);
		var chrome = /chrome/.test(userAgt.name); 
		var safari = /safari/.test(userAgt.name);
		var mobile = /android|webos|iphone|ipad|ipod|blackberry/.test(userAgt.name);
		var android = /android/.test(userAgt.name);
		var ios = /iphone|ipad|ipod/.test(userAgt.name);
		if(mobile){
			if(android){
				na='android';
		    }else if(ios){
		    	na='ios';
		    }
		}else{
			if(msie){
				na='msie';
		    }else if(chrome){
		    	na='chrome';
		    }else if(safari){
		    	na='safari';
		    }
		}
		return na;
	},
	msie_ver:function(){
		var version='';
	    var trident=navigator.userAgent.match(/Trident\/(\d.\d)/i);
	    var edge=navigator.userAgent.match(/edge/i);
	    if(trident!=null){
	        switch(trident[1]){
	            case '3.0': version='i7'; break;
	            case '4.0': version='i8'; break;
	            case '5.0': version='i9'; break;
	            case '6.0': version='i10'; break;
				case '7.0': version='i11'; break;
	        }
	    }
	    if(edge!=null){
	    	version='iedge';
	    }
	    return version;
	}
}

/*skip*/
var skip = {
	on:function(id){
		$(id).focus();
	},
	tdx:function(id){
		$(id).attr('tabindex','0').focus();
	}
}

// 다크모드 처리 스크립트
$(function(){
	modefun.on();
});
var modefun = {
    themeSkip:false,
    on:function(){
        // console.debug('modefun.themeSkip:', this.themeSkip);
        if (this.themeSkip) {
            $('#blackcss').remove();
            return;
        }
        // var mode = localStorage.getItem('mode');
        var mode = this.getMode();
        if(mode == 'black'){
            $('head').append('<link id="blackcss" rel="stylesheet" href="/css/common/theme_black.css">');
            $('body').addClass('bkmode');
            $(top.document).find('body').addClass('bkmode');
        }
        
        $('#mode').click(function(){
            let theme = '';
            let wrap = $('body');
            if(wrap.hasClass('bkmode')){
                // localStorage.clear();
                // $('#blackcss').remove();
                // wrap.removeClass('bkmode');
                $(top.document).find('body').removeClass('bkmode');
                theme = '';
            }else{
                // localStorage.setItem('mode','black');
                // $('head').append('<link id="blackcss" rel="stylesheet" href="/css/common/theme_black.css">');
                // wrap.addClass('bkmode');
                $(top.document).find('body').addClass('bkmode');
                theme = 'bkmode';
            }

            $.ajax({
                url: '/mtrade/setThemeAjax.nh',
                type: 'post',
                data: {'theme': theme},
                success: function(RESPONSE) {
                    location.href = getUrl('/myinvest/myInvest.nh');
                }
            });
        });
    },
    getMode:function(){
        return $('body').hasClass('bkmode') ? 'black' : '';
    }
}
	
	
var homeBtn = {/* 홈으로 이동하는 버튼 */
	on:function(){
		if( $('[class^="home-link-move"]').length ) {
			$('.wrap').scroll(function(){
				if ( $(this).scrollTop() >= 50 ){
					$('[class^="home-link-move"]').css({'visibility':'hidden','opacity':'0'});
				} else {
					$('[class^="home-link-move"]').css({'visibility':'visible','opacity':'1'});
				}
			})
		}
	}
}
			
/**
* Tab
* -----------------------------------------
* @param tabNavs : Object
* - 공통 탭 네비게이션 : tabHandler('.tabs')
*/
var tabHandler = function(tabNavs){
	var tabList = $(tabNavs).find('li');

	//init
	tabList.not('.exc').each(function(){
		var $li =$(this)
			$a = $li.find(' > a')
			activeTabClass = 'on'
			activeConClass = 'dp-block'
		;

		$a.attr('role', 'tab').attr('aria-selected', 'false');
		if($li.hasClass(activeTabClass)) $a.attr('title', '현재 탭').attr('aria-selected', true);

		//event
		$a.click(function(){
			if(!tabList.parents(tabNavs).hasClass('pageTab')){
				var tabId = $(this).parent().attr('data-tab');
				var tabConts = $(this).closest(tabNavs).siblings('.tab-content');

				tabList.removeClass(activeTabClass).find('>a').removeAttr('title').attr('aria-selected', false);
				$(this).parent().addClass(activeTabClass).find('>a').attr('title', '현재 탭').attr('aria-selected', true);

				tabConts.removeClass(activeConClass);
				$("#"+tabId).addClass(activeConClass);
			}
		});
	});
};

/*popup*/
var pop = {
	open:function(id,i){
		var _id = $('#'+id);
		var popsize = parseInt($('.popup_wrapper.opened').size());
		var _zindex = 10000+popsize;
		$(i).addClass('backfocu'+popsize);
		if(popsize == 0){
			_id.addClass('popbg');
			if(_id.find('>div').hasClass('pop_alert')){
				_id.find('.pop_alert').prepend('<i class="popbg_close popclose"></i>');
			}else{
				_id.prepend('<i class="popbg_close popclose"></i>');
			}
		}
		_id.addClass('opened').css('z-index',_zindex);//팝업열기
		_id.find(">div").attr("tabindex","0").focus();
		$('body,.wrap').addClass('modalOn');
		_id.find(".popclose").unbind('click').bind('click',function(){
			pop.close(id);
			$('.backfocu'+popsize).focus().removeClass('backfocu'+popsize);
		});
		_id.find('a,input,button,[tabindex=0]').last().unbind('keydown').bind('keydown', function(e){
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 9){
				_id.find('>div').focus();
			}
		});
	},
	close:function(id){
		var _id = $('#'+id);
		var popsize = $('.popup_wrapper.opened').size();
		_id.removeClass('opened');//팝업닫기
		_id.find('.popbg_close').remove();
		if(popsize <= 1){
			_id.removeClass('popbg');
			
			$('body,.wrap').removeClass('modalOn'); //팝업 닫기시 바디설정
		}
	}
}

/*calendar*/
var calpop = {
	on:function(id,i){
		/* 달력초기화 */
		$('.cal_pop').attr('id',id);
		$('#'+id+'>div').remove();
		$(i).parent().find('input').data('datepicker',null);
		$(i).parent().find('input').datepicker(); 
		/* 달력오픈 */
		pop.open(id,i);
	}
}
var inpPw = {
	on:function(){
		$('input[type="text"],input[type="password"]').each(function(idx,i){
			var textField = $(i);
			var saveText = null;
			if(textField.parent().hasClass('inp_pw')){
				saveText = textField.siblings('button');
			}
			textField.on('click',function(){
				if($(this).val().length >= 1){
					$(this).parent().addClass('on');
					if(saveText){saveText.removeAttr('disabled')}
				}
				$(this).on('keyup',function(){
					$(this).parent().addClass('on');
					if(saveText){saveText.removeAttr('disabled')}
					if($(this).val().length == 0){
						$(this).parent().removeClass('on');
						if(saveText){saveText.attr('disabled',true)}
					}
				});						
			});
		})
	}
}
	
function inputDelCtr(i){
	if(i==null){i='.inp_srh'}
	var textField = $(i+'>input');
	var deleteText = textField.siblings('.btn_delete');
	textField.on('click',function(){
		if($(this).val().length >= 1){
			$(this).addClass('on').siblings('.btn_delete').show();
		}
		$(this).on('blur',function(){
			var me = $(this);
			setTimeout(function(){
				me.removeClass('on').siblings('.btn_delete').hide();
			},100);
		});
		$(this).on('keyup',function(){
			$(this).addClass('on').siblings('.btn_delete').show();
			if($(this).val().length == 0){
				$(this).removeClass('on').siblings('.btn_delete').hide();
			}
		});
		// 공통 입력내용 지우기 버튼 시작
		deleteText.off('click').on('click',function(){
			$(this).siblings(textField).val("");
			$(this).hide();
		});
		
	});
}

var fzfun = {//notice_view font-size function
	fz : 1.6,
	on:function(i){
		if(i==0){
			fzfun.fz=fzfun.fz-0.1;
		}
		if(i==1){
			fzfun.fz=fzfun.fz+0.1;
		}
		$('.notic_view_con').css('font-size',fzfun.fz+'rem');
	}
}

var tooltip ={
	on:function(i){
		$(i).css('position','relative');
		var tiptext = $(i).attr('data-tip');
		var tipH = parseInt($(i).outerHeight(true));
		tipH = tipH+10;
		var tipHtml = '<div class="tip_box" style="bottom:'+tipH+'px">'+tiptext+'</div>';
		$(i).prepend(tipHtml);
	},
	off:function(i){
		$(i).find('.tip_box').remove();
	},
	alarm:function(i){
		tooltip.on(i);
		setTimeout(function(){
			tooltip.off(i);
		},2000)
	}
}

const selBox = {
	on:function(i){
		const selBox = $(i).parents('.selbox');
		const selTx = selBox.find('.sel_tx');
		const selOptBox = selBox.find('.sel_opt');
		const selOptItem = selOptBox.find('>*');

		selOptBox.slideToggle('fast');
		selOptItem.on('click',function(){
			const _this = $(this);
			const optVal =	_this.val();
			
			selOptBox.slideUp('fast');
			selTx.attr('value',optVal);
			selOptItem.removeAttr('selected');
			_this.attr('selected','true');
		});
		
		selTx.on('blur',function(){
			selOptBox.slideUp();
		})
	}
}

const popSelOpt = {
	select:function(i,target,popid){
		$(i).attr('selected','true').siblings().removeAttr('selected');
		$('#'+target).attr('value', $(i).val());
		pop.close(popid);
	}
}