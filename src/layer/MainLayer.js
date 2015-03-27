var MainLayer = cc.Layer.extend
({
	tables: new Array(16),
	tablesValues: new Array(),
	listener:null,
	offsetPoint:null,
	currentSpriteTag:null,
	_this:null,
	score: 0,
	gameOverStatus: GC.GAME_START_STATE,
	times:0,
	gameLevel:GC.PLAY_GAME_LEVEL,
	ctor:function()
	{
		this._super();
		cc.spriteFrameCache.addSpriteFrames(res.main_plist);
		cc.textureCache.addImage(res.main_png);
		_this = this;
		this.initBackground();
		this.initListener();
		if(!this.initLoadDB())
		{
			this.initRandomTag();
		}
		this.initMenu();
		this.schedule(this.gameUpdate, 1);
		this.schedule(this.saveUpdate, 5);
		this.playMusic(GC.PLAY_MUSIC_STATUS);
		return true;
	},
	gameUpdate:function(dt)
	{
		if(this.gameOverStatus == GC.GAME_OVER_STATE_ONE) //游戏结束状态1
		{
			this.times --;
			if(this.times == 0)
			{
				this.gameOverStatus  = GC.GAME_OVER_STATE_TWO;
				this.times = GC.GAME_RESET_TIME;
			}
		}
		else if(this.gameOverStatus == GC.GAME_OVER_STATE_TWO) //游戏结束, 准备重新开始状态
		{
			this.getChildByTag(GC.GAME_NOTICE_TAG_ID).setString("GAME START " + this.times + "... ");
			this.times -- ;
			if(this.times == 0)
			{
				this.gameOverStatus = GC.GAME_OVER_STATE_RESET;
			}
		}
		else if(this.gameOverStatus == GC.GAME_OVER_STATE_RESET) //重新开始状态
		{
			this.getChildByTag(GC.GAME_NOTICE_TAG_ID).setString("");
			this.gameOverStatus = GC.GAME_START_STATE;
			cc.eventManager.resumeTarget(this, true);
			this.resetGame();
		}
	},
	saveUpdate:function(dt)
	{
		store.storage.set(GC.STORE_SCORE_KEY, this.score);
		store.storage.set(GC.STORE_TABLES_KEY, this.tablesValues);
		store.storage.set(GC.STORE_OTHER_KEY, {playMusicStatus: GC.PLAY_MUSIC_STATUS,  playGameLevel:GC.PLAY_GAME_LEVEL});
	},
	checkGameState:function()//更新判断
	{
		var status = true;
		for(var i = 0;i< GC.squareRow; i++)
		{
			for(var j = 0; j< GC.squareCol; j++)
			{
				if(Math.floor(this.tablesValues[i][j]) == 0)
				{
					status = false;
					break;
				}
				if( i >= (GC.squareRow -1 ) ||  j>=(GC.squareCol - 1))
				{
					if(i >= (GC.squareRow -1 ))
					{
						if(this.tablesValues[i][j] == this.tablesValues[i][j + 1])
						{
							status = false;
							break;
						}
					}
					else if(this.tablesValues[i][j] == this.tablesValues[i+1][j])
					{
						status = false;
						break;
					}
				}
				else
				{
					if(this.tablesValues[i][j] == this.tablesValues[i][j + 1] || this.tablesValues[i][j] == this.tablesValues[i+1][j])
					{
						status = false;
						break;
					}
				}
			}
		}
		if(status)
		{
			this.getChildByTag(GC.GAME_NOTICE_TAG_ID).setString("Game Over");
			cc.eventManager.pauseTarget(this, true); 
			this.gameOverStatus = GC.GAME_OVER_STATE_ONE;
			this.times = 2;
		}
	},
	getCell:function(spriteTag) //获取单元格
	{
		var row = Math.floor(spriteTag / GC.squareRow);
		var col = spriteTag - row * GC.squareRow;
		return this.tablesValues[row][col];
	},
	setCell:function(spriteTag, value)//设置单元格
	{
		var row = Math.floor(spriteTag / GC.squareRow);
		var col = spriteTag - row * GC.squareRow;
		var LastValue = this.tablesValues[row][col];
		this.tablesValues[row][col] = value;
		this.getChildByTag(spriteTag).setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(Level.getLevelIcon(value)));
		if(value == 0)
		{
			value = "";
		}
		this.getLabelTag(spriteTag).setString(value);
	},
	drawCell: function(spriteTag, directionSpriteTag) //绘制方向单元格
	{
		var spriteVal = this.getCell(spriteTag);
		var directionVal = this.getCell(directionSpriteTag);
		var val = 0;
		if(spriteVal == directionVal || directionVal == 0) //数值相等
		{
			val = Math.floor(spriteVal) + Math.floor(directionVal);
			this.setCell(spriteTag, 0);//原始单元格清除
			this.setCell(directionSpriteTag, val);
			if(directionVal == 0)
			{
				this.setCell(this.getRandEmptyTag(), 2);
			}
			if(spriteVal == directionVal)
			{
				if(val > 0)
				{
					this.setScore(Math.log(val) / Math.log(2) * 5);
				}
			}
		}
	},
	setScore:function(score)// 设置得分
	{
		this.score = Math.floor(this.score) + Math.floor(score);
		this.getChildByTag(100).setString("score:"+ this.score);
	},
	drawLabel:function(spriteTag, value, direction) //绘制label
	{
		var spriteVal = this.getCell(spriteTag);
		var directionSpriteTag = this.getDirectionSpriteTag(spriteTag, direction);
		if(directionSpriteTag >= 0)//单元格存在
		{
			this.drawCell(spriteTag, directionSpriteTag); //绘制方向单元格
		}
		else if(directionSpriteTag <0 && spriteVal >0) //方向错误,有值就不写了
		{
			return true;
		}
		else if(value != "")//写入值
		{
			this.setCell(spriteTag, value);
		}
	},
	drawRowLabel:function(direction) //绘制label
	{
		var val = 0;
		switch(direction)
		{
			case GC.DIRECTION_UP: //向上
				for(var i = 0; i< GC.squareRow-1; i++)
				{
					for(var j = 0;j< GC.squareCol; j++)
					{
						if(this.tablesValues[i][j] == this.tablesValues[i+1][j] && this.tablesValues[i][j]>0)
						{
							this.tablesValues[i+1][j] = Math.floor(this.tablesValues[i+1][j]) + Math.floor(this.tablesValues[i][j]);
							val += Math.floor(this.tablesValues[i+1][j]);
							this.tablesValues[i][j] = 0;
						}
						else if(Math.floor(this.tablesValues[i][j])> 0 && Math.floor(this.tablesValues[i+1][j]) == 0)
						{
							this.tablesValues[i+1][j] = this.tablesValues[i][j];
							this.tablesValues[i][j] = 0;
						}
					}
				}
				break;
			case GC.DIRECTION_DOWN: //向下
				for(var i = GC.squareRow -1 ; i>0; i--)
				{
					for(var j = GC.squareCol - 1;j>=0 ; j--)
					{
						if(this.tablesValues[i][j] == this.tablesValues[i-1][j] && this.tablesValues[i][j]>0)
						{
							this.tablesValues[i-1][j] = Math.floor(this.tablesValues[i-1][j]) + Math.floor(this.tablesValues[i][j]);
							val += Math.floor(this.tablesValues[i-1][j]);
							this.tablesValues[i][j] = 0;
						}
						else if(Math.floor(this.tablesValues[i][j])> 0 && Math.floor(this.tablesValues[i-1][j]) == 0)
						{
							this.tablesValues[i-1][j] = this.tablesValues[i][j];
							this.tablesValues[i][j] = 0;
						}
					}
				}
				break;
			case GC.DIRECTION_LEFT: //向左
				for(var i = GC.squareCol -1; i >=0 ;i--)
				{
					for(var j = GC.squareCol - 1;j>0 ; j--)
					{
						if(this.tablesValues[i][j] == this.tablesValues[i][j-1] && this.tablesValues[i][j]>0)
						{
							this.tablesValues[i][j-1] = Math.floor(this.tablesValues[i][j-1]) + Math.floor(this.tablesValues[i][j]);
							val += Math.floor(this.tablesValues[i][j-1]);
							this.tablesValues[i][j] = 0;
						}
						else if(Math.floor(this.tablesValues[i][j])> 0 && Math.floor(this.tablesValues[i][j-1]) == 0)
						{
							this.tablesValues[i][j-1] = this.tablesValues[i][j];
							this.tablesValues[i][j] = 0;
						}
					}
				}
				break;
			case GC.DIRECTION_RIGHT://向右
				for(var i = 0; i< GC.squareCol;i++)
				{
					for(var j = 0;j< GC.squareCol - 1; j++)
					{
						if(this.tablesValues[i][j] == this.tablesValues[i][j+1] && this.tablesValues[i][j]>0)
						{
							this.tablesValues[i][j+1] = Math.floor(this.tablesValues[i][j+1]) + Math.floor(this.tablesValues[i][j]);
							val += Math.floor(this.tablesValues[i][j+1]);
							this.tablesValues[i][j] = 0;
						}
						else if(Math.floor(this.tablesValues[i][j])> 0 && Math.floor(this.tablesValues[i][j+1]) == 0)
						{
							this.tablesValues[i][j+1] = this.tablesValues[i][j];
							this.tablesValues[i][j] = 0;
						}
					}
				}
				break;
			default:
				return -1;
		}
		if(val > 0)
		{
			this.setScore(Math.log(val) / Math.log(2) * 10);
		}
		this.drawTables();
		this.setCell(this.getRandEmptyTag(), 2);
		return true;
	},
	getRandEmptyTag:function() //获取随机空tag
	{
		var tags = new Array();
		var pos = 0;
		for(var i = 0;i<GC.squareRow; i++)
		{
			for(var j = 0;j<GC.squareCol;j++)
			{
				if(Math.floor(this.tablesValues[i][j]) == 0)
				{
					tags[pos++] = i * GC.squareRow + j;
				}
			}
		}
		pos = Math.floor(cc.random0To1() * tags.length);
		return tags[pos];
	},
	drawTables:function() //绘制整个单元格
	{
		for(var i = 0; i< GC.squareRow; i++)
		{
			for(var j = 0; j< GC.squareCol; j++)
			{
				this.setCell(i*GC.squareRow + j, this.tablesValues[i][j]);
			}
		}
	},
	getDirectionSpriteTag:function(spriteTag, direction) //获取方向tag
	{
		var row = Math.floor(spriteTag / GC.squareRow);
		var col = spriteTag - row * GC.squareRow;
		switch(direction)
		{
			case GC.DIRECTION_UP: //向上
				row ++;
				break;
			case GC.DIRECTION_DOWN: //向下
				row--;
				break;	
			case GC.DIRECTION_LEFT: //向左
				col--;
				break;
			case GC.DIRECTION_RIGHT://向右
				col++;
				break;
			default:
				return -1;
		}
		if(row >= GC.squareRow || col >= GC.squareCol || row <0 || col <0)
		{
			return -1;
		}
		cc.log("row: "+ row + ", col: "+col +", direction:" + direction);
		return row * GC.squareRow + col;
	},
	getLabelTag:function(spriteTag) //获取标签tag
	{
		return this.getChildByTag(spriteTag + GC.squareRow * GC.squareCol);
	},
	initRandomTag:function()//初始化随机tag
	{
		for(var i= 0; i<3;i++)
		{
			var random = Math.floor(cc.random0To1() * 16);
			this.drawLabel(random, "2", -1);
		}
	},
	initLoadDB:function()
	{
		var exits = false;
		var score = store.storage.get(GC.STORE_SCORE_KEY);
		var values = store.storage.get(GC.STORE_TABLES_KEY);
		var other = store.storage.get(GC.STORE_OTHER_KEY);
		if (score !== false && score > 0)
		{
			exits = true;
			this.setScore(score);
		}
		if(values !== false)
		{
			this.tablesValues = values;
			this.drawTables();
		}
		if(other !== false)
		{
			GC.PLAY_MUSIC_STATUS = other.playMusicStatus;
			GC.PLAY_GAME_LEVEL = other.playGameLevel;
		}
		return exits;
	},
	initBackground:function()//初始化背景
	{
		var scoreLabel = new cc.LabelTTF("score:0", "Arial",  42 * GC.multiple);
		var warnLabel = new cc.LabelTTF("", "Arial", 35 * GC.multiple);
		scoreLabel.attr({
			x:GC.width /2,
			y:GC.height - 50*6,
			color:cc.color(255, 0, 0)
		});
		warnLabel.attr({
			x:GC.width /2,
			y:GC.height/5,
			color:cc.color(0, 255, 255)
		});
		this.addChild(scoreLabel, 0, 100);
		this.addChild(warnLabel, 0, GC.GAME_NOTICE_TAG_ID);
		for(var i = 0;i< GC.squareRow; i++)
		{
			this.tablesValues[i] = new Array();
			for(var j = 0;j< GC.squareCol;j++)
			{
				var sprite = new cc.Sprite("#1.png");
				var label = new cc.LabelTTF("", "Arial", 32 * GC.multiple);
				var x = GC.squareInitX + GC.squareWidth * j + GC.squareSpace*j;
				var y = GC.squareInitY + GC.squareHeight * i + GC.squareSpace*i;
				var pos = i * GC.squareRow + j;
				this.tables[pos] = cc.p(x, y);
				this.tablesValues[i][j] = 0;
				sprite.attr({
					x: x,
					y: y,
					scale:GC.scale
				});
				label.attr({
					x:x,
					y:y,
					color:cc.color(0,0,0)
				});
				this.addChild(sprite, 0, pos);
				this.addChild(label, 0, pos + GC.squareRow * GC.squareCol);
			}
		}
	},
	initListener:function()
	{
		this.listener = cc.EventListener.create
		({
			event:cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches:true,
			onTouchBegan:function(touch, event)
			{
				var target = event.getCurrentTarget();
				var point = touch.getLocation();
				var locationInNode = target.convertToNodeSpace(point);
				var s = target.getContentSize();
				if(cc.rectContainsPoint(cc.rect(0, 0, s.width, s.height), locationInNode))
				{
					_this.offsetPoint = point;
					_this.currentSpriteTag = target.getTag();
					return true
				}
				return false;
			},
			onTouchMoved:function(touch, event)
			{
				var target = event.getCurrentTarget();
			},
			onTouchEnded:function(touch, event)
			{
				var target = event.getCurrentTarget();
				var point = touch.getLocation();
				var direction = _this.getDirection(_this.offsetPoint, point);
				if(_this.gameLevel == GC.PLAY_GAME_LEVEL)
				{
					_this.drawRowLabel(direction);
				}
				else
				{
					_this.drawLabel(_this.currentSpriteTag, "", direction);
				}
				_this.checkGameState();
			}
		});
		for(var i = 0; i<16; i++)
		{
		    cc.eventManager.addListener(this.listener.clone(), this.getChildByTag(i));
		}
	},
	initMenu:function()
	{
		cc.MenuItemFont.setFontName("Arial");
		cc.MenuItemFont.setFontSize(25 * GC.multiple);
		var playSprite = new cc.Sprite(res.play_menu_png);
		playSprite.attr
		({
			x: GC.width/12 * GC.multiple,
			y:GC.height / 12,
			scale:0.5
		});
		this.addChild(playSprite, 0);
		var item = new cc.MenuItemToggle(
				new cc.MenuItemFont("easy"),
				new cc.MenuItemFont("hard"),
				this.setPlayGame, this
		);
		item.setSelectedIndex(GC.PLAY_GAME_LEVEL ? 1:0);
		item.setColor(cc.color(0, 50, 255));
		var playMenu = new cc.Menu(item);
		playMenu.attr({
			x:playSprite.x + playSprite.getContentSize().width * 0.5 + 30,
			y:GC.height / 12
		});
		this.addChild(playMenu, 0);
		var sprite = new cc.Sprite(res.music_sound_on_png);
		sprite.attr
		({
			x: playMenu.x + GC.squareSpace * 10,
			y:GC.height /12,
			scale:0.5
		});
		this.addChild(sprite, 0);
		cc.MenuItemFont.setFontName("Arial");
		var item = new cc.MenuItemToggle(
				new cc.MenuItemFont("on"),
				new cc.MenuItemFont("off"),
				this.setMusicButton, this
		);
		item.setColor(cc.color(0, 50, 255));
		item.setSelectedIndex(GC.PLAY_MUSIC_STATUS ? 1:0);
		var menu = new cc.Menu(item);
		menu.attr({
			x:sprite.x + 30 * GC.multiple ,
			y:GC.height / 12
		});
		this.addChild(menu, 0);
	},
	getDirection:function(point1, point2) //获取方向
	{
		var xAdd = point2.x - point1.x;
		var yAdd = point2.y - point1.y;
		var direction = -1;
		if(Math.abs(xAdd) > Math.abs(yAdd))
		{
			if(xAdd < 0)
			{
				direction = GC.DIRECTION_LEFT;
				cc.log("left");
			}
			else if(xAdd > 0)
			{
				direction = GC.DIRECTION_RIGHT;
				cc.log("right");
			}
		}
		else
		{
			if(yAdd <0)
			{
				direction = GC.DIRECTION_DOWN;
				cc.log("down");
			}
			else if(yAdd > 0)
			{
				direction = GC.DIRECTION_UP;
				cc.log("up");
			}
		}
		return direction;
	},
	setPlayGame:function(sender)
	{
		GC.PLAY_GAME_LEVEL = ! GC.PLAY_GAME_LEVEL;
		if(GC.PLAY_GAME_LEVEL) //hard
		{
			this.gameLevel = 1;
		}
		else // easy
		{
			this.gameLevel = 0;
		}
		this.resetGame();
	},
	resetGame:function()
	{
		this.resetTables();
		this.score = 0;
		this.setScore(0);
		this.initRandomTag();
	},
	resetTables:function()
	{
		for(var i =0 ;i< GC.squareRow; i++)
		{
			for(var j = 0 ; j< GC.squareRow; j++)
			{
				this.tablesValues[i][j] = 0;
			}
		}
		this.drawTables();
	},
	setMusicButton:function(sender)
	{
		GC.PLAY_MUSIC_STATUS = ! GC.PLAY_MUSIC_STATUS;
		if(GC.PLAY_MUSIC_STATUS)
		{
			this.playMusic(true);
		}
		else
		{
			this.playMusic(false);
		}
	},
	playMusic:function(status) //播放音乐
	{
		if(status)
		{
			cc.audioEngine.playMusic(res.sound_mp3, true);
		}
		else
		{
			if (cc.audioEngine.isMusicPlaying()) 
			{
				cc.audioEngine.stopMusic();
			}
		}
	}
});