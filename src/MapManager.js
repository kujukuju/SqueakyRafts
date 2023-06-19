class MapManager {
    static TEXTURE = PIXI.Texture.from('assets/map.png');
    static ICON_TEXTURE = PIXI.Texture.from('assets/pleb-map-icon.png');

    static sprite;
    static icon;

    static progress;
    static mapScale;

    static lastAudioPlayTime;

    static previousQ;

    static initialize() {
        MapManager.sprite = new PIXI.Sprite(MapManager.TEXTURE);
        MapManager.sprite.visible = false;
        Renderer.map.addChild(MapManager.sprite);

        MapManager.icon = new PIXI.Sprite(MapManager.ICON_TEXTURE);
        MapManager.icon.visible = false;
        MapManager.icon.anchor.x = 0.5;
        MapManager.icon.anchor.y = 0.9;
        MapManager.icon.scale.x = 2.0;
        MapManager.icon.scale.y = 2.0;
        Renderer.map.addChild(MapManager.icon);

        MapManager.progress = 0;
        MapManager.mapScale = 1;

        MapManager.resize();

        MapManager.lastAudioPlayTime = 0;

        MapManager.previousQ = false;
    }

    static update() {
        const visible = !!Input.keys[Input.KEY_Q];
        if (visible !== MapManager.previousQ) {
            MapManager.previousQ = visible;
            if (visible) {
                MapManager.lastAudioPlayTime = Loop.time;
                AudioInformation.playAudio(AudioInformation.open_map.create());
            }
        }
        if (visible) {
            MapManager.progress = Math.min(MapManager.progress + 0.05, 1);
        } else {
            MapManager.progress = Math.max(MapManager.progress - 0.05, 0);
        }

        const eased = MathHelper.easeInOut(MapManager.progress);
        MapManager.sprite.position.x = (window.innerWidth - MapManager.sprite.width) / 2;
        MapManager.sprite.position.y = (window.innerHeight - window.innerHeight * eased) + (window.innerHeight - MapManager.sprite.height) / 2;

        const entity = EntityInformation.getClientEntity();
        if (entity) {
            const progressX = entity.getPosition().x / (2048 / 0.04);
            const progressY = entity.getPosition().y / (1024 / 0.04);

            MapManager.icon.position.x = MapManager.sprite.position.x + MapManager.sprite.width * progressX;
            MapManager.icon.position.y = MapManager.sprite.position.y + MapManager.sprite.height * progressY;

            MapManager.icon.visible = true;
        } else {
            MapManager.icon.visible = false;
        }

        if (MapManager.progress === 0) {
            MapManager.sprite.visible = false;
        } else {
            MapManager.sprite.visible = true;
        }
    }

    static resize() {
        MapManager.mapScale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080) * 0.8;

        MapManager.sprite.width = 1920 * MapManager.mapScale;
        MapManager.sprite.height = 1080 * MapManager.mapScale;
    }
}