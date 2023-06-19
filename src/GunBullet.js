class GunBullet {
    static TEXTURE = PIXI.Texture.from('assets/coin-projectile.png');

    start;
    position;
    direction;

    sprite;

    constructor(start, direction) {
        this.start = Vec2.copy(start);
        this.position = Vec2.copy(start);
        this.direction = Vec2.copy(direction);

        this.sprite = new PIXI.Sprite(GunBullet.TEXTURE);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.position.x = start.x;
        this.sprite.position.y = start.y - 12;
        this.sprite.zIndex = start.y;
        Renderer.abovewaterForeground.addChild(this.sprite);
    }

    update() {
        this.position.x += this.direction.x * 25;
        this.position.y += this.direction.y * 25;

        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y - 12;
        this.sprite.zIndex = this.position.y;

        cullSprite(this.sprite);

        let destroyed = false;
        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const entity = entityList[i];
            if (entity instanceof PlebEntity) {
                if (entity.getPosition().distance(this.position) < 20) {
                    if (Information.moon) {
                        Packets.writeBitPacket(entity.id);
                        entity.bit();
                    }
                    
                    this.destroy();
                    destroyed = true;
                }
            }
        }

        if (!destroyed && this.position.distance(this.start) > 600) {
            this.destroy();
        }
    }

    destroy() {
        this.sprite.destroy();
        GunBulletManager.removeBullet(this);
    }
}