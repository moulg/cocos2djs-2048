var util = util || {};
util.serialize = function(value)
{
    return json.stringify(value);
};
util.deserialize = function(value)
{
    if (typeof value != 'string')
    {
        return undefined;
    }
    try
    {
        return json.parse(value);
    }
    catch (e)
    {
        return value || undefined;
    }
};

/**
 * 时间格式化yyyy/mm/dd
 */
util.timeFormat = function (dt, format)
{
	var dd = dt.getDate();
	var mm = dt.getMonth() + 1; // January is 0!
	var yyyy = dt.getFullYear();
	if (dd < 10) 
	{
		dd = '0' + dd;
	}
	if (mm < 10) 
	{
		mm = '0' + mm;
	}
	return yyyy + format + mm + format + dd;
};

/**
 * 去掉空格
 */
util.trim = function( text )
{
	if(String.prototype.trim)
	{
		return text == null?
				"":
					String.prototype.trim.call( text );
	}
	else
	{
		var trimLeft = /^\s+/;
		var trimRight = /\s+$/;
		return text == null?
				"":
					text.toString().replace( trimLeft, "" ).replace( trimRight, "" );  
	}             
};

/**
 * 是否邮箱
 */
util.isEmail = function (str)
{
	var reg = /^\s*([A-Za-z0-9_-]+(\.\w+)*@(\w+\.)+\w{2,3})\s*$/;
	return reg.test(str);
};

/**
 * 检查qq号
 */
util.isQQ = function (str)
{
	var reg = /^[1-9]\d{4,10}$/;
	return reg.test(str);
};

/**
 * 检查电话
 */
util.isTel = function (str)
{
	var reg = /^\s*[.0-9]{8,11}\s*$/;
	return reg.test(str);
};

/**
 * 检查邮编
 */
util.isPostcode = function(str)
{
	var reg = /^[0-9]\d{5}(?!\d)/;
	return reg.test(str);
};

/**
 * 根据日期获取星座
 * 
 * 摩羯座(12/22 - 1/19)、水瓶座(1/20 - 2/18)、双鱼座(2/19 - 3/20)、牡羊座(3/21 - 4/20)、金牛座(4/21 -
 * 5/20)、 双子座(5/21 - 6/21)、巨蟹座(6/22 - 7/22)、狮子座(7/23 - 8/22)、处女座(8/23 -
 * 9/22)、天秤座(9/23 - 10/22)、 天蝎座(10/23 - 11/21)、射手座(11/22 - 12/21)
 */
util.getZodiac = function (month, day)
{
	var d = new Date(1999, month - 1, day, 0, 0, 0);
	var arr = [];
	arr.push(["摩羯座", new Date(1999, 0, 1, 0, 0, 0)]);
	arr.push(["水瓶座", new Date(1999, 0, 20, 0, 0, 0)]);
	arr.push(["双鱼座", new Date(1999, 1, 19, 0, 0, 0)]);
	arr.push(["牧羊座", new Date(1999, 2, 21, 0, 0, 0)]);
	arr.push(["金牛座", new Date(1999, 3, 21, 0, 0, 0)]);
	arr.push(["双子座", new Date(1999, 4, 21, 0, 0, 0)]);
	arr.push(["巨蟹座", new Date(1999, 5, 22, 0, 0, 0)]);
	arr.push(["狮子座", new Date(1999, 6, 23, 0, 0, 0)]);
	arr.push(["处女座", new Date(1999, 7, 23, 0, 0, 0)]);
	arr.push(["天秤座", new Date(1999, 8, 23, 0, 0, 0)]);
	arr.push(["天蝎座", new Date(1999, 9, 23, 0, 0, 0)]);
	arr.push(["射手座", new Date(1999, 10, 22, 0, 0, 0)]);
	arr.push(["摩羯座", new Date(1999, 11, 22, 0, 0, 0)]);
	for (var i = arr.length - 1; i >= 0; i--) 
	{
		if (d >= arr[i][1]) 
			return arr[i][0];
	}
};
/**
 * 数组去重复 
 */
util.unique = function (data)
{
	data = data || [];
	var a = {};
	for (var i = 0, len = data.length; i < len; i++) 
	{
		var v = data[i];
		if ('undefined' == typeof(a[v])) 
		{
			a[v] = 1;
		}
	}
	data.length = 0;
	for (var i in a) 
	{
		data[data.length] = i;
	}

	return data;
};

/**
 * 获取纯字符长度
 */
util.fucCheckLength = function (strTemp)
{
	var i, sum;
	sum = 0;
	for (i = 0; i < strTemp.length; i++) 
	{
		if ((strTemp.charCodeAt(i) >= 0) && (strTemp.charCodeAt(i) <= 255)) 
			sum = sum + 1;
		else 
			sum = sum + 2;
	}
	return sum;
};

/**
 * 截字
 * @param {} str   需要截字的字符串
 * @param {} idx1  开始位置
 * @param {} idx2  结束位置
 * @return {}
 */
util.subStringByByte = function subStringByByte (str, idx1, idx2)
{
	var n = 0, start = str.length, end = str.length;

	for (var i = 0; i < str.length; i++) 
	{
		if (n <= idx1) 
		{
			start = i;
		}
		if (str.charCodeAt(i) < 128) 
		{
			n++;
		}
		else 
		{
			n += 2;
		}

		if (n > idx2) 
		{
			end = i;
			break;
		}
	}
	return str.substring(start, end);
};

/**
 * 日期的格式化
 */
Date.prototype.format = function(format) //author: meizz 
{
	var o = { 
			"M+" : this.getMonth()+1, //month 
			"d+" : this.getDate(),    //day 
			"h+" : this.getHours(),   //hour 
			"m+" : this.getMinutes(), //minute 
			"s+" : this.getSeconds(), //second 
			"q+" : Math.floor((this.getMonth()+3)/3),  //quarter 
			"S"  : this.getMilliseconds() //millisecond 
	};
	if(/(y+)/.test(format)) 
	{
		format=format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
	}
	for(var k in o)
	{
		if(new RegExp("("+ k +")").test(format)) 
		{
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
		}
	}
};


