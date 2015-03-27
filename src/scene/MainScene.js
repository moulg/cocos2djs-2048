var MainScene = cc.Scene.extend
({
	ctor:function()
	{
		this._super();
		var layer = new cc.LayerColor(cc.color(255, 255,255));
		this.addChild(layer);
		this.addChild(new MainLayer);
	}
});