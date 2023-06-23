class DeathScreen {
    // static TEXTURE = PIXI.Texture.from('assets/death-screen.png');
    static FADED_TEXTURE = PIXI.Texture.from((function() {
        if (IFRAME_ORIGIN && IFRAME_ORIGIN.includes('crazygames')) {
            return 'assets/faded-clear.png';
        } else {
            return 'assets/faded.png';
        }
    })());
    static RESPAWN_TEXTURE = PIXI.Texture.from('assets/faded-respawn.png');

    // static sprite;
    static faded;
    static respawn;

    static initialize() {
        // DeathScreen.sprite = new PIXI.Sprite(DeathScreen.TEXTURE);
        // DeathScreen.sprite.anchor.x = 0.5;
        // DeathScreen.sprite.anchor.y = 0.5;
        // DeathScreen.sprite.scale.x = 3;
        // DeathScreen.sprite.scale.y = 3;
        // DeathScreen.sprite.position.x = window.innerWidth / 2;
        // DeathScreen.sprite.position.y = window.innerHeight / 2;
        // DeathScreen.sprite.visible = false;
        // Renderer.map.addChild(DeathScreen.sprite);

        DeathScreen.faded = new PIXI.Sprite(DeathScreen.FADED_TEXTURE);
        DeathScreen.faded.anchor.x = 0.5;
        DeathScreen.faded.anchor.y = 0.5;
        DeathScreen.faded.width = window.innerWidth;
        DeathScreen.faded.height = window.innerHeight;
        DeathScreen.faded.position.x = window.innerWidth / 2;
        DeathScreen.faded.position.y = window.innerHeight / 2;
        DeathScreen.faded.visible = false;
        Renderer.map.addChild(DeathScreen.faded);

        DeathScreen.respawn = new PIXI.Sprite(DeathScreen.RESPAWN_TEXTURE);
        DeathScreen.respawn.anchor.x = 0.5;
        DeathScreen.respawn.anchor.y = 0.5;
        DeathScreen.respawn.width = window.innerWidth;
        DeathScreen.respawn.height = window.innerHeight;
        DeathScreen.respawn.position.x = window.innerWidth / 2;
        DeathScreen.respawn.position.y = window.innerHeight / 2;
        DeathScreen.respawn.visible = false;
        Renderer.map.addChild(DeathScreen.respawn);

        DeathScreen.resize();
    }

    static update() {
        if (DeathScreen.respawn.visible) {
            const aabb = new AABB(window.innerWidth * (170 / 640), window.innerHeight * (212 / 360), window.innerWidth * (294 / 640), window.innerHeight * (90 / 360));
            let clicked = Input.mouseDownLeft && aabb.contains(Input.mousePosition.x, Input.mousePosition.y);
            if (!clicked) {
                for (const touchID in MobileControls.touches) {
                    const touch = MobileControls.touches[touchID];
                    clicked = clicked || aabb.contains(touch.x, touch.y);
                }
            }

            if (clicked) {
                if (EntityInformation.getClientEntity()) {
                    EntityInformation.getClientEntity().destroy();
                    if (IFRAME_ORIGIN && IFRAME_ORIGIN.includes('crazygames')) {
                        const doneCallback = () => {
                            Logic.hasSpawned = false;
                            EntityInformation._clientStringID = null;
                            EntityInformation._clientID = null;
                            DeathScreen.hideFaded();
                            MainMenu.mainMenuVisible = true;
                        };
                        const callbacks = {
                            adFinished: () => {
                                doneCallback();
                            },
                            adError: (error) => {
                                doneCallback();
                            },
                            adStarted: () => {

                            },
                        };

                        window.CrazyGames.SDK.ad.requestAd("midgame", callbacks);
                    }
                }
            }
        }
    }

    static show() {
        // DeathScreen.sprite.visible = true;
    }

    static showFaded() {
        DeathScreen.faded.visible = true;
        setTimeout(() => {
            if (DeathScreen.faded.visible) {
                DeathScreen.respawn.visible = true;
            }
        }, 1000);
    }

    static hideFaded() {
        DeathScreen.faded.visible = false;
        DeathScreen.respawn.visible = false;
    }

    static resize() {
        DeathScreen.faded.position.x = window.innerWidth / 2;
        DeathScreen.faded.position.y = window.innerHeight / 2;
        DeathScreen.faded.width = window.innerWidth;
        DeathScreen.faded.height = window.innerHeight;
        DeathScreen.respawn.position.x = window.innerWidth / 2;
        DeathScreen.respawn.position.y = window.innerHeight / 2;
        DeathScreen.respawn.width = window.innerWidth;
        DeathScreen.respawn.height = window.innerHeight;
    }
}