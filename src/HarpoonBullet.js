class HarpoonBullet {
    static TEXTURE = PIXI.Texture.from('assets/rock-projectile.png');

    start;
    position;
    direction;

    sprite;

    raftID;

    constructor(raftID, start, direction) {
        this.raftID = raftID;
        this.start = Vec2.copy(start);
        this.position = Vec2.copy(start);
        this.direction = Vec2.copy(direction);

        this.sprite = new PIXI.Sprite(HarpoonBullet.TEXTURE);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.position.x = start.x;
        this.sprite.position.y = start.y - 12;
        this.sprite.zIndex = start.y;
        Renderer.abovewaterForeground.addChild(this.sprite);
    }

    update() {
        this.position.x += this.direction.x * 18;
        this.position.y += this.direction.y * 18;

        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y - 12;
        this.sprite.zIndex = this.position.y;

        cullSprite(this.sprite);

        let destroyed = false;
        const potentialSharkHit = SharkManager.getSharkNearPoint(this.position);
        if (potentialSharkHit) { 
            if (Information.moon) {
                potentialSharkHit.shot(this.start);
            }
s
            this.destroy();
            destroyed = true;
        }

        const potentialRaftInfo = RaftManager.getNearbyPartOffsets(this.position);
        if (potentialRaftInfo) {
            const potentialRaft = potentialRaftInfo[0];
            const potentialRaftOffsets = potentialRaftInfo[1];

            if (potentialRaft.id !== this.raftID) {
                if (Information.moon) {
                    potentialRaft.removePart(potentialRaftOffsets.x, potentialRaftOffsets.y, true);
                }

                this.destroy();
                destroyed = true;
            }
        }

        if (!destroyed && this.position.distance(this.start) > 600) {
            this.destroy();
        }
    }

    destroy() {
        this.sprite.destroy();
        HarpoonBulletManager.removeBullet(this);
    }
}