/* =========================================================
 * bootstrap-datepicker.js
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

!function( $ ) {

	// Picker object
	var minDate;
	var maxDate;
	var minDate2;
	var maxDate2;
	var endDate;
	var Datepicker = function(element, options){
		this.element = $(element);
		if(this.element.next().attr('data-min') != null || this.element.next().attr('data-max') != null)
		{
			minDate = this.element.next().attr('data-min').split('.');
			maxDate = this.element.next().attr('data-max').split('.');

			minDate2 = this.element.next().attr('data-min');
			maxDate2 = this.element.next().attr('data-max');
		}
		if(this.element.next().attr('data-end') != null){
			endDate = this.element.next().attr('data-end').split('.');
		}

		this.format = DPGlobal.parseFormat(options.format||this.element.data('date-format')||'yyyy.mm.dd');
		this.picker = $(DPGlobal.template)
							/*.appendTo(this.element.parent())*/
							/*.appendTo( $('#'+this.element.next().attr('data-target')).find('>div'))*/
							.appendTo($('#'+this.element.next().attr('data-target')))
							.on({
								click: $.proxy(this.click, this)//,
								//mousedown: $.proxy(this.mousedown, this)
							});
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on') : false;

		if (this.isInput) {
			this.element.on({
				focus: $.proxy(this.show, this),
				//blur: $.proxy(this.hide, this),
				keyup: $.proxy(this.update, this)
			});
		} else {
			if (this.component){
				this.component.on('click', $.proxy(this.show, this));
			} else {
				this.element.on('click', $.proxy(this.show, this));
			}
		}

		this.minViewMode = options.minViewMode||this.element.data('date-minviewmode')||0;
		if (typeof this.minViewMode === 'string') {
			switch (this.minViewMode) {
				case 'months':
					this.minViewMode = 1;
					break;
				case 'years':
					this.minViewMode = 2;
					break;
				default:
					this.minViewMode = 0;
					break;
			}
		}
		this.viewMode = options.viewMode||this.element.data('date-viewmode')||0;
		if (typeof this.viewMode === 'string') {
			switch (this.viewMode) {
				case 'months':
					this.viewMode = 1;
					break;
				case 'years':
					this.viewMode = 2;
					break;
				default:
					this.viewMode = 0;
					break;
			}
		}
		this.startViewMode = this.viewMode;
		this.weekStart = options.weekStart||this.element.data('date-weekstart')||0;
		this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1;

		// customize for megabox. (by wooram)
		this.markingDates = options.markingDates;

		this.onRender = options.onRender;
		this.fillDow();
		this.fillMonths();
		this.update();
		this.showMode();
	};

	Datepicker.prototype = {
		constructor: Datepicker,
		setEndDate : function (date) {

			date += '';

			var arrData = [date.substring (0, 4), ((date.substring (4, 6)>>0) - 1), date.substring (6, 8)]
			, resultDate = DPGlobal.formatDate(new Date (arrData[ 0 ], arrData[ 1 ], arrData[ 2 ]), this.format);

			endDate = resultDate.split('.');
		},
		show: function(e) {

			//this.picker.show();
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			this.place();
			$(window).on('resize', $.proxy(this.place, this));
			if (e ) {
				e.stopPropagation();
				e.preventDefault();
			}
			if (!this.isInput) {
			}
			var that = this;
			$(document).on('click', function(ev){
				if ($(ev.target).closest('.datepicker').length == 0) {
					that.hide();
				}
			});



			this.element.trigger({
				type: 'show',
				date: this.date
			});
		},

		hide: function(){
			$(window).off('resize', this.place);
			this.viewMode = this.startViewMode;
			this.showMode();
			if (!this.isInput) {
				$(document).off('mousedown', this.hide);
			}
			//this.set();
			this.element.trigger({
				type: 'hide',
				date: this.date
			});
		},

		set: function() {
			var formated = DPGlobal.formatDate(this.date, this.format);
			if (!this.isInput) {
				if (this.component){
					this.element.find('input').prop('value', formated);
				}
				this.element.data('date', formated);
			} else {
				this.element.prop('value', formated);
			}

		},

		setValue: function(newDate) {
			if (typeof newDate === 'string') {
				this.date = DPGlobal.parseDate(newDate, this.format);
			} else {
				this.date = new Date(newDate);
			}
			this.set();
			this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
			this.fill();
		},

		place: function(){
			var offset = this.component ? this.component.offset() : this.element.offset();
			this.picker.css({
				top: offset.top + this.height,
				left: offset.left
			});
		},

		update: function(newDate){
			this.date = DPGlobal.parseDate(
				typeof newDate === 'string' ? newDate : (this.isInput ? this.element.prop('value') : this.element.data('date')),
				this.format
			);
			this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
			this.fill();
		},


		updateMarking:function(markingDates) {
			this.markingDates = markingDates;
			this.fill();
		},

		fillDow: function(){
			var dowCnt = this.weekStart;
			var html = '<ul>';
			while (dowCnt < this.weekStart + 7) {
				html += '<li class="dow">'+DPGlobal.dates.daysMin[(dowCnt++)%7]+'</li>';
			}
			html += '</ul>';
			this.picker.find('.datepicker-days .weeks').append(html);
		},

		fillMonths: function(){
			var html = '';
			var i = 0
			while (i < 12) {
				html += '<span class="month">'+DPGlobal.dates.monthsShort[i++]+'</span>';
			}
			this.picker.find('.datepicker-months td').append(html);
		},

		fill: function() {
			var d = new Date(this.viewDate),
				year = d.getFullYear(),
				month = d.getMonth(),
				days = d.getDay(),
				currentDate = this.date.valueOf();

			this.picker.find('.datepicker-days .yearDate')
						.text(year+'년 '+DPGlobal.dates.months[month]);
			this.picker.find('.datepicker-days .yearSel>a').text(year);
			var minOpt = 2000, maxOpt = 2030;
			this.picker.find('.datepicker-days .yearSelopt').empty();
			for (var i=minOpt; i<maxOpt;i++){
				this.picker.find('.datepicker-days .yearSelopt').prepend('<a href="javascript:void(0)" role="button">'+i+'</a>');
			}
			this.picker.find('.datepicker-days .yearSelopt>a').removeClass('active').attr('aria-label','');
			this.picker.find('.datepicker-days .yearSelopt>a').each(function(idx,i){
				if($(i).text() == year){
					$(i).addClass('active').attr('aria-label','선택됨');
				}
			});
			
			var prevMonth = new Date(year, month-1, 28,0,0,0,0),
				day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
			
			
			prevMonth.setDate(day);
			prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setDate(nextMonth.getDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName,
				prevY,
				prevM;
			while(prevMonth.valueOf() < nextMonth) {
				var aTitle = "";
				if (prevMonth.getDay() === this.weekStart) {
					html.push('<tr>');
				}
				clsName = this.onRender(prevMonth);
				prevY = prevMonth.getFullYear();
				prevM = prevMonth.getMonth();
				if ((prevM < month &&  prevY === year) ||  prevY < year) {
					clsName += ' old';
				} else if ((prevM > month && prevY === year) || prevY > year) {
					clsName += ' new';
				}

				if (prevMonth.valueOf() === currentDate) {
					clsName += ' active';
					aTitle = "선택됨";
				}
				if (typeof this.markingDates !== 'undefined') {
					for (var i=0; i < this.markingDates.length; i++) {
						var arrDate=this.markingDates[i].split('-');
						var markingDate = new Date(Number(arrDate[0]),Number(arrDate[1])-1,Number(arrDate[2]));
						if (prevM === (markingDate.getMonth()) && prevMonth.getDate() === markingDate.getDate()) {
							if (prevMonth.valueOf() === currentDate) {
								aTitle = '선택됨';
								clsName += ' active';
							}else{
								aTitle = '선택 가능일';
							}
						}
					}
				}

				html.push('<td class="day '+clsName+'"><a href="javascript:void(0);" role="button" aria-label="' + aTitle + '">'+prevMonth.getDate() + '</a></td>');
				
				if (prevMonth.getDay() === this.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setDate(prevMonth.getDate()+1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
			var currentYear = this.date.getFullYear();

			var months = this.picker.find('.datepicker-months')
						.find('th:eq(2)')
							.text(year)
							.end()
						.find('span').removeClass('active');
			if (currentYear === year) {
				months.eq(this.date.getMonth()).addClass('active');
			}

			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(2)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			for (var i = -1; i < 11; i++) {
				html += '<span class="year'+(i === -1 || i === 10 ? ' old' : '')+(currentYear === year ? ' active' : '')+'">'+year+'</span>';
				year += 1;
			}
			
			/*선택날짜 표시*/
			var daysNum = this.picker.find('.datepicker-days tbody td.active').index();
			var dayTx = this.picker.find('.datepicker-days tbody td.active>a').text();
			if(dayTx){
				this.picker.find('.datepicker-days .currentDate')
				.text(DPGlobal.dates.months[month]+" "+dayTx+"일 "+DPGlobal.dates.daysMin[daysNum]+"요일");
			}
			
			
			yearCont.html(html);
		},

		todayCk: false,
		click: function(e) {
			e.stopPropagation();
			e.preventDefault();
			//alert(e.target)
			this.todayCk = false;
			var target = $(e.target).parents('span, td, th, p');
			if (target.length === 1) {
				
				switch(target[0].nodeName.toLowerCase()) {
					case 'p':
						switch(target[0].className) {
							case 'switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								this.picker.find('.yearSel.active>a').trigger('click');
								this.viewDate['set'+DPGlobal.modes[this.viewMode].navFnc].call(
									this.viewDate,
									this.viewDate['get'+DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate) +
									DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1)
								);
								this.fill();
								break;
							case 'prev2':
							case 'next2':
								this.picker.find('.yearSel.active>a').trigger('click');
								year = this.viewDate.getFullYear();

								if (target.hasClass('prev2')){
										year -= 1;
								}
								else if (target.hasClass('next2')){
										year += 1;
								}
								this.viewDate.setFullYear(year);
								this.fill();
								break;
						
							case 'yearSel':
								$('.yearSel, .yearSelopt').addClass('active');
								var aidx = $(target).find('.yearSelopt>*.active').index();
								var aH = $(target).find('.yearSelopt>*').outerHeight(true);
								var scrH = aidx*aH;
								$(target).find('.yearSelopt').scrollTop(scrH);
								$(target).find('.yearSelopt>*').unbind('click').bind('click',function(){
									$(target).find('.yearSelopt>*').removeClass('active').attr('aria-label','');
									$(this).addClass('active').attr('aria-label','선택됨');
									var opt = $(this).text();
									$(this).parents('.yearSel').find('>a').text(opt);
									$(this).parent().toggleClass('active');
									$(this).parents('.yearSel.active').find('>a').click().focus();
								});
								break;
								
							case 'yearSel active':
								$('.yearSel, .yearSelopt').removeClass('active');
								year = $(target).find('a:eq(0)').text();
								this.viewDate.setFullYear(year);
								this.fill();
								break;
								
							case 'today':
								
								this.picker.find('.yearSel.active>a').trigger('click');
								date = new Date();
								year = date.getFullYear();
								day = date.getDate(); 
								month = date.getMonth();
								this.viewDate.setFullYear(year);
								this.viewDate.setMonth(month);
								this.viewDate.setDate(day);
								
								this.date = new Date(this.viewDate);
								this.element.trigger({
									type: 'changeDate',
									date: this.date,
									viewMode: DPGlobal.modes[this.viewMode].clsName
								});
								this.fill();
								break;							
						}
						break;
					case 'span':
						switch(target[0].className) {
							case 'calendarClose':
								this.picker.find('.day.active>a').trigger('click');
								if(this.todayCk == true){
									return false;//today가 설정에서 벗어날경우
								}
								endDate = null;
								//닫기버튼클릭시
								break;
						}
						if (target.is('.month')) {
							var month = target.parent().find('span').index(target);
							this.viewDate.setMonth(month);
						} else {
							var year = parseInt(target.text(), 10)||0;
							this.viewDate.setFullYear(year);
						}
						if (this.viewMode !== 0) {
							this.date = new Date(this.viewDate);
							this.element.trigger({
								type: 'changeDate',
								date: this.date,
								viewMode: DPGlobal.modes[this.viewMode].clsName
							});
						}
						this.showMode(-1);
						this.fill();
						this.set();
						break;
					case 'td':
						this.picker.find('.yearSel.active>a').trigger('click');
						
						if (target.is('.day') && !target.is('.disabled')){
							var day = parseInt(target.text(), 10)||1;
							var month = this.viewDate.getMonth();
							if (target.is('.old')) {
								month -= 1;
							} else if (target.is('.new')) {
								month += 1;
							}
							var year = this.viewDate.getFullYear();
							if(endDate != null){
								var endDateF = endDate[0]+'.'+endDate[1]+'.'+endDate[2];
								var endDatetx = '마감일['+endDateF+'] 이후 기간은 선택할 수 없습니다.';	
								if(endDate[0] < this.viewDate.getFullYear())
								{
									this.todayCk = true;
									alert(endDatetx);
									return false;
								}
								else if(endDate[0] == this.viewDate.getFullYear()){
									if (target.is('.old')){
										if(endDate[1] < this.viewDate.getMonth())
										{
											this.todayCk = true;
											alert(minDate[1] + ':' + this.viewDate.getMonth());
											alert(endDatetx);
											return false;
										}
										else if(endDate[1] == this.viewDate.getMonth()){
											if(endDate[2] < Number(parseInt(target.text(), 10)||1))
											{
												this.todayCk = true;
												alert(minDate[1] + ':' + this.viewDate.getMonth());
												alert(endDatetx);
												return false;
											}
											else{
												//alert(minDate[2] + ':' + parseInt(target.text(), 10)||1)
											}
										}
									}
									else if (target.is('.new')){
										if(endDate[1] < this.viewDate.getMonth() + 2)
										{
											this.todayCk = true;
											alert(endDatetx);
											return false;
										}
										else if(endDate[1] == this.viewDate.getMonth() + 2){
											if(endDate[2] < Number(parseInt(target.text(), 10)||1))
											{
												this.todayCk = true;
												alert(endDatetx);
												return false;
											}
										}
									}
									else{
										if(endDate[1] < this.viewDate.getMonth() + 1)
										{
											this.todayCk = true;
											alert(endDatetx);
											return false;
										}
										else if(endDate[1] == this.viewDate.getMonth() + 1){
											if(endDate[2] < Number(parseInt(target.text(), 10)||1))
											{
												this.todayCk = true;
												alert(endDatetx);
												return false;
											}
										}
									}

								}

							}
							
							var periodString = (minDate2 == "0000.0.0" || minDate2 == "0000.00.00")
								?  maxDate2 + ' 이전 날짜만 선택 가능합니다.' : minDate2 + ' ~ ' + maxDate2 + ' 기간만 선택가능합니다.';
							
							if(minDate != null || maxDate != null){
								if(minDate != null){

									if(minDate[0] > this.viewDate.getFullYear())
									{
										if(this.element.next().attr('data-link') != null){
											this.todayCk = true;
											alert(periodString);
											return false;
										}
									}
									else if(minDate[0] == this.viewDate.getFullYear()){

										if (target.is('.old')){
											if(minDate[1] > this.viewDate.getMonth())
											{
												if(this.element.next().attr('data-link') != null){
													this.todayCk = true;
													alert(periodString);
													return false;
												}
											}
											else if(minDate[1] == this.viewDate.getMonth()){
												if(minDate[2] > Number(parseInt(target.text(), 10)||1))
												{
													if(this.element.next().attr('data-link') != null){
														this.todayCk = true;
														alert(periodString);
														return false;
													}
												}
											}
										}
										else if (target.is('.new')){
											if(minDate[1] > this.viewDate.getMonth() + 2)
											{
												if(this.element.next().attr('data-link') != null){
													this.todayCk = true;
													alert(periodString);
													return false;
												}
											}
											else if(minDate[1] == this.viewDate.getMonth() + 2){
												if(minDate[2] > Number(parseInt(target.text(), 10)||1))
												{
													if(this.element.next().attr('data-link') != null){
														this.todayCk = true;
														alert(periodString);
														return false;
													}
												}
											}
										}
										else{
											if(minDate[1] > this.viewDate.getMonth() + 1)
											{
												if(this.element.next().attr('data-link') != null){
													this.todayCk = true;
													alert(periodString);
													return false;
												}
											}
											else if(minDate[1] == this.viewDate.getMonth() + 1){
												if(minDate[2] > Number(parseInt(target.text(), 10)||1))
												{
													if(this.element.next().attr('data-link') != null){
														this.todayCk = true;
														alert(periodString);
														return false;
													}
												}
											}
										}

									}
								}
								if(maxDate != null){

									if(maxDate[0] < this.viewDate.getFullYear())
									{
										if(this.element.next().attr('data-link') != null){
											this.todayCk = true;
											alert(periodString);
											return false;
										}
									}
									else if(maxDate[0] == this.viewDate.getFullYear()){
										if (target.is('.old')){
											if(maxDate[1] < this.viewDate.getMonth())
											{
												if(this.element.next().attr('data-link') != null){
													this.todayCk = true;
													alert(periodString);
													return false;
												}
											}
											else if(maxDate[1] == this.viewDate.getMonth()){
												if(maxDate[2] < Number(parseInt(target.text(), 10)||1))
												{
													if(this.element.next().attr('data-link') != null){
														this.todayCk = true;
														alert(periodString);
														return false;
													}
												}
											}
										}
										else if (target.is('.new')){
											if(maxDate[1] < this.viewDate.getMonth() + 2)
											{
												if(this.element.next().attr('data-link') != null){
													this.todayCk = true;
													alert(periodString);
													return false;
												}
											}
											else if(maxDate[1] == this.viewDate.getMonth() + 2){
												if(maxDate[2] < Number(parseInt(target.text(), 10)||1))
												{
													if(this.element.next().attr('data-link') != null){
														this.todayCk = true;
														alert(periodString);
														return false;
													}
												}
											}
										}
										else{
											if(maxDate[1] < this.viewDate.getMonth() + 1)
											{
												if(this.element.next().attr('data-link') != null){
													this.todayCk = true;
													alert(periodString);
													return false;
												}
											}
											else if(maxDate[1] == this.viewDate.getMonth() + 1){
												if(maxDate[2] < Number(parseInt(target.text(), 10)||1))
												{
													if(this.element.next().attr('data-link') != null){
														this.todayCk = true;
														alert(periodString);
														return false;
													}
												}
											}
										}

									}
								}
							}

							// 시작 ~ 종료일이 있을 경우
							var formated = DPGlobal.formatDate(new Date(year, month, day,0,0,0,0), this.format);

							if(this.element.next().attr('data-link') != null){
								if(this.element.next().attr('data-link')=='start'){
									var endV = 	this.element.parents('.inp_start_end').next().find('[data-link=end]').prev().val();
									if( endV != '')
									{
										if(formated >= endV){
											this.todayCk = true;
											alert("종료일["+endV+"] 이후 기간은 선택할 수 없습니다.");
											return false;
										}
									}

								}else if(this.element.next().attr('data-link')=='end'){
									var startV = this.element.parents('.inp_start_end').prev().find('[data-link=start]').prev().val();
									if(startV != '')
									{
										if(formated <= startV){
											this.todayCk = true;
											alert("시작일["+startV+"] 이전 기간은 선택할 수 없습니다.");
											return false;
										}
									}
								}
							}



							this.date = new Date(year, month, day,0,0,0,0);
							this.viewDate = new Date(year, month, Math.min(28, day),0,0,0,0);

							this.fill();
							//this.set();
							this.element.trigger({
								type: 'changeDate',
								date: this.date,
								viewMode: DPGlobal.modes[this.viewMode].clsName
							});

							setTimeout(function(){
								$('.datepicker td.active a').focus();

							}, 100);

								//this.focus();
						}
						break;

				}
			}
		},

		mousedown: function(e){
			e.stopPropagation();
			e.preventDefault();
		},

		showMode: function(dir) {
			if (dir) {
				this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + dir));
			}
			//this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
			this.picker.filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
		}
	};

	$.fn.datepicker = function ( option, val ) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option === 'object' && option;
			if (!data) {
				$this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.datepicker.defaults,options))));
			}
			if (typeof option === 'string') data[option](val);
		});
	};

	$.fn.datepicker.defaults = {
		onRender: function(date) {
			return '';
		}
	};
	$.fn.datepicker.Constructor = Datepicker;

	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		dates:{
			days: ["일", "월", "화", "수", "목", "금", "토", "일"],
			daysShort: ["일", "월", "화", "수", "목", "금", "토", "일"],
			daysMin: ["일", "월", "화", "수", "목", "금", "토", "일"],
			months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
			monthsShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
		},
		isLeapYear: function (year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
		},
		getDaysInMonth: function (year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
		},
		parseFormat: function(format){
			var separator = format.match(/[.\/\-\s].*?/),
				parts = format.split(/\W+/);
			if (!separator || !parts || parts.length === 0){
				throw new Error("Invalid date format.");
			}
			return {separator: separator, parts: parts};
		},
		parseDate: function(date, format) {
			var parts = date.split(format.separator),
				date = new Date(),
				val;
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			if (parts.length === format.parts.length) {
				var year = date.getFullYear(), day = date.getDate(), month = date.getMonth();
				for (var i=0, cnt = format.parts.length; i < cnt; i++) {
					val = parseInt(parts[i], 10)||1;
					switch(format.parts[i]) {
						case 'dd':
						case 'd':
							day = val;
							date.setDate(val);
							break;
						case 'mm':
						case 'm':
							month = val - 1;
							date.setMonth(val - 1);
							break;
						case 'yy':
							year = 2000 + val;
							date.setFullYear(2000 + val);
							break;
						case 'yyyy':
							year = val;
							date.setFullYear(val);
							break;
					}
				}
				date = new Date(year, month, day, 0 ,0 ,0);
			}
			return date;
		},
		formatDate: function(date, format){
			var val = {
				d: date.getDate(),
				m: date.getMonth() + 1,
				yy: date.getFullYear().toString().substring(2),
				yyyy: date.getFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			var date = [];
			for (var i=0, cnt = format.parts.length; i < cnt; i++) {
				date.push(val[format.parts[i]]);
			}
			return date.join(format.separator);
		},

		headTemplate1:
			'<div class="controlDiv1">'+
			'<p class="yearSel">'+
			'<a href="javascript:void(0)" role="button" aria-label="년도선택">전체</a>'+
			'<span class="yearSelopt" tabindex="0">'+
			'</span>'+
			'</p>'+
			'<p class="currentDate"></p>'+
			'<p class="today"><a href="javascript:void(0);" title="오늘날짜">today</a></p>'+
			'</div>',
	    headTemplate2:
			'<div class="controlDiv">'+
			'<p class="prev2"><a href="javascript:void(0);" title="이전년도 보기"><span class="visualhide">이전년도</span></a></p>'+
			'<p class="prev"><a href="javascript:void(0);" title="이전달 보기"><span class="visualhide">이전달</span></a></p>'+
			'<p class="yearDate"></p>'+
			'<p class="next"><a href="javascript:void(0);" title="다음달 보기"><span class="visualhide">다음달</span></a></p>'+
			'<p class="next2"><a href="javascript:void(0);" title="다음년도 보기"><span class="visualhide">다음년도</span></a></p>'+
			'<p class="today"><a href="javascript:void(0);" title="오늘날짜">오늘</a></p>'+
			'</div>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
	};
	DPGlobal.template ='<div class="pop_function">'+
							'<div class="pop_in">'+
								'<div class="pop_header text-center">'+
									'<h3>날짜선택</h3>'+
								'</div>'+
								'<div class="datepicker dropdown-menu">'+
									'<div class="datepicker-days">'+
										//DPGlobal.headTemplate1+
										DPGlobal.headTemplate2+
										'<div class="daysDiv">'+
										'<div class="weeks"></div>'+
										'<table class="table-condensed" cellpadding="0" cellspacing="0">'+
										'<caption><strong>날짜선택 달력</strong></caption>' +
											'<tbody></tbody>'+
										'</table>'+			
										'<div class="pop_footer">'+
										//'<a href="javascript:void(0);" class="laypop_close btn_l btn_w">취소</a>'+
										'<span class="calendarClose btn_pop3"><button type="button" class="btn_pop3 popclose">확인</button></span>'+
										'</div>'+
										'</div>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>';

}( window.jQuery );

