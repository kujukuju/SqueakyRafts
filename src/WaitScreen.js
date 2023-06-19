class WaitScreen {
    static TEXTURE = PIXI.Texture.from('assets/wait-notice.png');

    static sprite;

    static visibleTime = 0;

    static initialize() {
        WaitScreen.sprite = new PIXI.Sprite(WaitScreen.TEXTURE);
        WaitScreen.sprite.width = window.innerWidth;
        WaitScreen.sprite.height = window.innerHeight;
        WaitScreen.sprite.visible = false;
        Renderer.map.addChild(WaitScreen.sprite);
    }

    static update() {
        if (MainMenu.mainMenuVisible) {
            return;
        }

        // TODO this shows up when they leave the island no matter what
        const clientEntity = EntityInformation.getClientEntity();
        if (clientEntity && (clientEntity instanceof PlebEntity) && IslandManager.spawnIsland > 0 && WaitScreen.visibleTime === 0) {
            WaitScreen.visibleTime = Loop.time;
        } else if (clientEntity && WaitScreen.visibleTime === 0) {
            WaitScreen.visibleTime = 1;
        }

        if (Loop.time - WaitScreen.visibleTime < 24000) {
            WaitScreen.sprite.visible = true;
        } else {
            WaitScreen.sprite.visible = false;
        }
    }
}