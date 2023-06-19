window.onload = () => {
    Renderer.initialize();
    Environment.initialize();
    Connection.initialize();
    AudioInformation.initialize();
    InstructionPage.initialize();
    MapManager.initialize();
    DeathScreen.initialize();
    WaitScreen.initialize();
    MainMenu.initialize();
    WinManager.initialize();
    ChatManager.initialize();
    MobileControls.initialize();

    Loop.loop();

    window.addEventListener('resize', () => {
        Renderer.resize();
    });

    if (Information.moon) {
        setInterval(() => {
            const date = new Date();
            if (date.getHours() === 1) {
                if (date.getMinutes() === 50) {
                    if (!warnedRestart) {
                        warnedRestart = true;
                        Packets.writeChatPacket(0, "The server will restart in 10 minutes!");

                        setTimeout(() => {
                            Packets.writeChatPacket(0, "The server will restart in 1 minute!");
                        }, 9 * 60 * 1000);

                        setTimeout(() => {
                            Packets.writeChatPacket(0, "The server will restart in 10 seconds!");
                        }, 9 * 60 * 1000 + 50 * 1000);

                        setTimeout(() => {
                            process.exit();
                        }, 10 * 60 * 1000);
                    }
                }
            }
        }, 60 * 1000);
    }
};

let warnedRestart = false;

const createNewClientEntity = () => {
    if (Information.moon) {
        Logic.hasSpawned = true;
        const id = Math.floor(Math.random() * 2147483647) + 1;
        EntityInformation.setClientEntityID(id);
        const entity = EntityInformation.addEntity(id, new MoonEntity(true));
        entity.setPosition(new Vec2(2872, 10835));
    }
};

FramedSprite.prototype.updateFrame = function() {
    if (this.animations[this.currentName]) {
        this.texture = this.textures[Math.floor(this.currentFrame) + this.animations[this.currentName].start];
    } else {
        this.texture = this.textures[Math.floor(this.currentFrame)];
    }
};

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

/*
let time = 0;
setInterval(() => {
    time += 4;

    let value = Math.sin(time / 100.0) / 2.0 + 0.5;
    Environment.waterFilter.setOpacity(value * 0.5);
    Environment.waterFilter.setStrength(value * 0.5);
    Environment.waterFilter.setBackgroundColor([40 / 255 * value, 49 / 255 * value, 68 / 255 * value]);
    Environment.firstIsland.tint = Math.floor(255 * value) << 16 | Math.floor(255 * value) << 8 | Math.floor(255 * value);
    Environment.firstIslandUnderwater.tint = Math.floor(255 * value) << 16 | Math.floor(255 * value) << 8 | Math.floor(255 * value);
}, 30);
*/