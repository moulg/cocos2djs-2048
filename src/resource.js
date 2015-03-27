var res = {
    HelloWorld_png : "res/HelloWorld.png",
    CloseNormal_png : "res/CloseNormal.png",
    CloseSelected_png : "res/CloseSelected.png",
    main_plist:"res/main.plist",
    main_png :"res/main.png",
    music_sound_off_png:"res/sound_off.png",
    music_sound_on_png :"res/sound_on.png",
    sound_mp3:"res/music/sound.mp3",
    play_menu_png:"res/game.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}