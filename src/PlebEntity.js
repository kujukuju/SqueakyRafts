class PlebEntity extends VoiceEntity {
    static TEXTURE = PIXI.Texture.from('assets/pleb-2.png');
    static HEAD_TEXTURE = PIXI.Texture.from('assets/pleb-head.png');
    static SHADOW_TEXTURE = PIXI.Texture.from('assets/pleb-shadow.png');

    id;
    sprite;
    headSprite;
    shadowSprite;

    position_;
    velocity_;
    groundVelocity;

    username;
    lastUsername;
    usernameText;

    tint;

    constructor(client) {
        super();

        this.sprite = new FramedSprite(PlebEntity.TEXTURE, 19, 29, 17, 136);
        if (!client) this.sprite.filters = [Environment.interactableColorShader];
        this.sprite.anchor.x = 9 / 19;
        this.sprite.anchor.y = 26 / 29;
        this.sprite.addAnimation('idle-front', 0, 1);
        this.sprite.addAnimation('idle-left', 1, 1);
        this.sprite.addAnimation('idle-right', 2, 1);
        this.sprite.addAnimation('idle-back', 3, 1);
        this.sprite.addAnimation('walk-front', 4, 10);
        this.sprite.addAnimation('walk-left', 14, 10);
        this.sprite.addAnimation('walk-right', 24, 10);
        this.sprite.addAnimation('walk-back', 34, 10);
        this.sprite.addAnimation('holding-front', 44, 1);
        this.sprite.addAnimation('holding-left', 45, 1);
        this.sprite.addAnimation('holding-right', 46, 1);
        this.sprite.addAnimation('holding-back', 47, 1);
        this.sprite.addAnimation('holding-walk-front', 48, 10);
        this.sprite.addAnimation('holding-walk-left', 58, 10);
        this.sprite.addAnimation('holding-walk-right', 68, 10);
        this.sprite.addAnimation('holding-walk-back', 78, 10);
        this.sprite.addAnimation('punch-front', 88, 4);
        this.sprite.addAnimation('punch-left', 92, 4);
        this.sprite.addAnimation('punch-right', 96, 4);
        this.sprite.addAnimation('punch-back', 100, 4);
        this.sprite.addAnimation('swim-front', 104, 4);
        this.sprite.addAnimation('swim-left', 108, 4);
        this.sprite.addAnimation('swim-right', 112, 4);
        this.sprite.addAnimation('swim-back', 116, 4);
        this.sprite.addAnimation('paddle-front', 120, 3);
        this.sprite.addAnimation('paddle-left', 123, 3);
        this.sprite.addAnimation('paddle-right', 126, 3);
        this.sprite.addAnimation('paddle-back', 129, 3);
        this.sprite.addAnimation('interact-front', 132, 1);
        this.sprite.addAnimation('interact-left', 133, 1);
        this.sprite.addAnimation('interact-right', 134, 1);
        this.sprite.addAnimation('interact-back', 135, 1);
        this.sprite.addAnimation('dead', 135, 1);
        linkAll(this.sprite, ['walk-front', 'walk-left', 'walk-right', 'walk-back']);
        linkAll(this.sprite, ['holding-walk-front', 'holding-walk-left', 'holding-walk-right', 'holding-walk-back']);
        linkAll(this.sprite, ['punch-front', 'punch-left', 'punch-right', 'punch-back']);
        linkAll(this.sprite, ['swim-front', 'swim-left', 'swim-right', 'swim-back']);
        linkAll(this.sprite, ['paddle-front', 'paddle-left', 'paddle-right', 'paddle-back']);
        Renderer.abovewaterForeground.addChild(this.sprite);

        this.headSprite = new FramedSprite(PlebEntity.HEAD_TEXTURE, 19, 29, 4, 16);
        if (!client) this.headSprite.filters = [Environment.interactableColorShader];
        this.headSprite.anchor.x = this.sprite.anchor.x;
        this.headSprite.anchor.y = this.sprite.anchor.y;
        this.headSprite.addAnimation('swim-front', 0, 4);
        this.headSprite.addAnimation('swim-left', 4, 4);
        this.headSprite.addAnimation('swim-right', 8, 4);
        this.headSprite.addAnimation('swim-back', 12, 4);
        Renderer.abovewaterForeground.addChild(this.headSprite);

        this.shadowSprite = new PIXI.Sprite(PlebEntity.SHADOW_TEXTURE);
        this.shadowSprite.anchor.x = 0.5;
        this.shadowSprite.anchor.y = 0.5;
        Renderer.abovewaterShadows.addChild(this.shadowSprite);

        this.position_ = new Vec2();
        this.velocity_ = new Vec2();
        this.groundVelocity = new Vec2();

        this.username = '';

        this.usernameText = new PIXI.Text('', {fontFamily: 'Aloevera', fontSize: 32, fill: 0x000000, align: 'center'});
        this.usernameText.anchor.x = 0.5;
        this.usernameText.anchor.y = 1.0;
        this.usernameText.scale.x = 0.25;
        this.usernameText.scale.y = 0.25;
        Renderer.abovewaterForeground.addChild(this.usernameText);
    }

    update() {
        super.update();

        if (EntityInformation.getClientEntity() === this) {
            if (this.downed && Loop.time - this.downedTime > 10 * 1000) {
                const entities = EntityInformation.getEntityList();
                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i];
                    if (entity instanceof PlebEntity) {
                        if (entity.punching) {
                            if (entity.getFrontPoint().distance(this.getPosition()) < 20) {
                                this.downed = false;
                                DeathScreen.hideFaded();
                            } else if (entity.getPosition().distance(this.getPosition()) < 20) {
                                this.downed = false;
                                DeathScreen.hideFaded();
                            }
                        }
                    }
                }
            }
        }

        const base = (this.id * 17) % 40 + (255 - 40);
        this.tint = (base << 16) | (base << 8) | base;
        this.sprite.tint = this.tint;
        this.headSprite.tint = this.tint;

        if (this.username !== this.lastUsername) {
            this.lastUsername = this.username;

            if (this.username && (typeof this.username === 'string')) {
                if (this.username.length > 16) {
                    this.username.length = 16;
                }

                this.usernameText.text = this.username;
            }
        }
    }

    sendPackets() {
        Packets.writeMoonPacket(this.id, false);
        Packets.writeMoonDownPacket(this.id, this.downed);

        super.sendPackets();
    }

    updateAnimation() {
        const updated = super.updateAnimation();
        if (updated) {
            return;
        }

        if (this.downed) {
            this.sprite.gotoAnimation('dead', 0);
        }

        // update shooting?
    }

    render() {
        super.render();

        this.usernameText.position.x = this.sprite.position.x;
        this.usernameText.position.y = this.sprite.position.y - 32;
        this.usernameText.zIndex = this.sprite.zIndex;
    }

    getHeight() {
        return 15;
    }

    bit() {
        if (EntityInformation.getClientEntity() === this) {
            DeathScreen.showFaded();
        }

        this.downed = true;
        this.downedTime = Loop.time;
    }

    destroy() {
        super.destroy();

        WinManager.plebDeaths++;

        this.sprite.destroy();
        this.headSprite.destroy();
        this.shadowSprite.destroy();
        this.usernameText.destroy();

        PlebDeathManager.addDeadPleb(this.id, this.getPosition());
    }
}