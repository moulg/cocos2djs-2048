var json = json || {};
json.m = {
			'\b' : '\\b',
			'\t' : '\\t',
			'\n' : '\\n',
			'\f' : '\\f',
			'\r' : '\\r',
			'"' : '\\"',
			'\\' : '\\\\'
	 }; 
json.s = {
	'boolean' : function(x)
	{
		return String(x);
	},
	number : function(x)
	{
		return isFinite(x) ? String(x) : 'null';
	},
	string : function(x)
	{
		if (/["\\\x00-\x1f]/.test(x))
		{
			x = x.replace(/([\x00-\x1f\\"])/g, function(a, b)
					{
				var c = json.m[b];
				if (c)
				{
					return c;
				}
				c = b.charCodeAt();
				return '\\u00' + Math.floor(c / 16).toString(16)
				+ (c % 16).toString(16);
					});
		}
		return '"' + x + '"';
	},
	object : function(x)
	{
		if (x)
		{
			var a = [], b, f, i, l, v;
			if (x instanceof Array)
			{
				a[0] = '[';
				l = x.length;
				for (i = 0; i < l; i += 1)
				{
					v = x[i];
					f = json.s[typeof v];
					if (f)
					{
						v = f(v);
						if (typeof v == 'string')
						{
							if (b)
							{
								a[a.length] = ',';
							}
							a[a.length] = v;
							b = true;
						}
					}
				}
				a[a.length] = ']';
			}
			else if (x instanceof Object)
			{
				a[0] = '{';
				for (i in x)
				{
					v = x[i];
					f = json.s[typeof v];
					if (f)
					{
						v = f(v);
						if (typeof v == 'string')
						{
							if (b)
							{
								a[a.length] = ',';
							}
							a.push(json.s.string(i), ':', v);
							b = true;
						}
					}
				}
				a[a.length] = '}';
			}
			else
			{
				return;
			}
			return a.join('');
		}
		return 'null';
	}
};
json.copyright = '(c)2005 JSON.org';
json.license = 'http://www.JSON.org/license.html';
 /*
  * Stringify a JavaScript value, producing a JSON text.
  */
json.stringify = function(v)
{
	 var f = json.s[typeof v];
	 if (f)
	 {
		 v = f(v);
		 if (typeof v == 'string')
		 {
			 return v;
		 }
	 }
	return null;
};
 /*
  * Parse a JSON text, producing a JavaScript value. It returns false
  * if there is a syntax error.
  */
json.parse = function(text)
{
	try
    {
	 return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(text
			 .replace(/"(\\.|[^"\\])*"/g, '')))
			 && eval('(' + text + ')');
    }
    catch (e)
   {
	 return false;
   }
}