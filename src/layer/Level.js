var Level = Level || {};
Level.getLevel = function(value)
{
	var level = 1;
	if(value > Math.pow(2, 6))
	{
		level = 6;
	}
	else if(value > Math.pow(2, 5))
	{
		level = 5;
	}
	else if(value >= Math.pow(2, 4))
	{
		level = 4;
	}
	else if(value >= Math.pow(2, 3))
	{
		level = 3;
	}
	else if(value >= Math.pow(2, 2))
	{
		level = 2;
	}
	return level;
}
Level.getLevelIcon = function(value)
{
	return Level.getLevel(value) + ".png";
}