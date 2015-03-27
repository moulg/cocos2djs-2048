var store = store  || {};
store.serialize = function(value)
{
	return json.stringify(value);
};

store.deserialize = function(value)
{
	if (typeof value != 'string')
	{
		return false;
	}
	try
	{
		return json.parse(value);
	}
	catch (e)
	{
		return value || false;
	}
};
store.storage = {};
/**
 * 存储设置
 */
store.storage.set = function(key, val)
{
	if (val === "")
	{
		return cc.sys.localStorage.remove(key);
	}
	cc.sys.localStorage.setItem(key, store.serialize(val));
	return val;
};

/**
 * 存储获取
 */
store.storage.get = function(key)
{
	return store.deserialize(cc.sys.localStorage.getItem(key));
};

/**
 * 存储移除
 */
store.storage.remove = function(key)
{
	cc.sys.localStorage.removeItem(key);
};

/**
 * 存储清除
 */
store.storage.clear = function()
{
	cc.sys.localStorage.clear();
};

/**
 * 获取所有存储
 */
store.storage.getAll = function()
{
	var ret = {};
	for ( var i = 0; i < cc.sys.localStorage.length; ++i)
	{
		var key = cc.sys.localStorage.key(i);
		ret[key] = store.storage.get(key);
	}
	return ret;
};