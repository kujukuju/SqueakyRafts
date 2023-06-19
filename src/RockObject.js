class RockObject {
    static TEXTURE1 = PIXI.Texture.from('assets/rock1.png');
    static TEXTURE2 = PIXI.Texture.from('assets/rock2.png');
    static SHADOW_TEXTURE = PIXI.Texture.from('assets/wood-shadow.png');

    id;

    position;
    sprite;
    shadowSprite;

    angle;
    direction;
    speed;
    heightSpeed;
    height;

    playerID;

    underwater;
    oldUnderwater;
    checkUnderwaterFrameCount;

    onRaft;

    constructor(parentID, point) {
        this.id = (parentID + 1) << 16;
        this.id = this.id | Math.floor(65536 * Math.random());

        this.position = Vec2.copy(point);
        const texture = Math.random() < 0.5 ? RockObject.TEXTURE1 : RockObject.TEXTURE2;
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.filters = [Environment.interactableColorShader];
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 1.0;
        this.sprite.position.x = point.x;
        this.sprite.position.y = point.y;
        this.sprite.zIndex = point.y;
        Renderer.abovewaterForeground.addChild(this.sprite);
        this.shadowSprite = new PIXI.Sprite(RockObject.SHADOW_TEXTURE);
        this.shadowSprite.anchor.x = 0.5;
        this.shadowSprite.anchor.y = 0.75;
        this.shadowSprite.position.x = point.x;
        this.shadowSprite.position.y = point.y;
        Renderer.abovewaterShadows.addChild(this.shadowSprite);

        this.angle = Math.random() * Math.PI * 2;
        this.direction = new Vec2(Math.cos(this.angle), Math.sin(this.angle));
        this.speed = Math.random() * 1.0 + 1.5;
        // this.progress = 0;
        this.heightSpeed = Math.random() * 1.0 + 2.5;
        this.height = 20;

        this.playerID = 0;

        this.underwater = false;
        this.oldUnderwater = false;
        this.checkUnderwaterFrameCount = 0;

        this.onRaft = false;
    }

    update() {
        if (this.playerID && !EntityInformation.hasEntity(this.playerID)) {
            this.playerID = 0;
        }

        this.onRaft = false;
        let waveOffset = 0;
        if (this.playerID) {
            const player = EntityInformation.getEntity(this.playerID);
            this.underwater = player.visuallySwimming;
        } else {
            const raft = RaftManager.getOnRaft(this.position);
            if (raft) {
                this.onRaft = true;
                const velocity = raft.getLinearVelocity(this.position);
                this.position.add(velocity);
                this.underwater = false;
                waveOffset = raft.waveOffset;
            } else {
                this.checkUnderwaterFrameCount = (this.checkUnderwaterFrameCount + 1) % 20;
                if (this.checkUnderwaterFrameCount === 0) {
                    this.underwater = IslandManager.isSwimming(this.position) && !IslandManager.isNearIsland(this.position);
                }
            }
        }

        if (this.underwater && !this.oldUnderwater) {
            this.oldUnderwater = this.underwater;

            this.sprite.parent.removeChild(this.sprite);
            Renderer.underwaterForeground.addChild(this.sprite);
        } else if (!this.underwater && this.oldUnderwater) {
            this.oldUnderwater = this.underwater;

            this.sprite.parent.removeChild(this.sprite);
            Renderer.abovewaterForeground.addChild(this.sprite);
        }

        // this.speed = Math.max(this.speed - 0.05, 0);
        // this.progress = Math.min(this.progress + 0.05, 1);
        this.height = Math.max(this.height + this.heightSpeed, 0);
        this.heightSpeed = this.heightSpeed - 0.3;
        if (this.height === 0 || this.playerID) {
            this.speed = 0;
            this.heightSpeed = 0;
        }
    
        this.position.x += this.direction.x * this.speed;
        this.position.y += this.direction.y * this.speed;

        if (this.playerID) {
            const player = EntityInformation.getEntity(this.playerID);
            if (player) {
                let playerPosition;
                if (player === EntityInformation.getClientEntity()) {
                    playerPosition = player.getPosition();
                } else {
                    playerPosition = player.getInterpolatedPosition();
                }

                this.position.x = playerPosition.x;
                this.position.y = playerPosition.y + 1;
                const swimmingOffset = player.swimming ? player.getHeight() / 2 : 0;
                this.height = player.getHeight() - swimmingOffset;
            }
        }

        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y - this.height + waveOffset;
        this.sprite.zIndex = this.position.y;
        this.shadowSprite.position.x = this.position.x;
        this.shadowSprite.position.y = this.position.y + waveOffset;
        
        cullSprite(this.sprite);
        if (this.playerID) {
            this.shadowSprite.visible = false;
        } else {
            if (this.underwater) {
                this.shadowSprite.visible = false;
            } else {
                this.shadowSprite.visible = true;
                cullSprite(this.shadowSprite);
            }
        }
    }

    setCarry(player, sendPackets) {
        // if theres async carry requests let the lower id person win
        if (this.playerID && this.playerID < player.id) {
            player.carryingRockID = 0;

            return;
        }

        player.carryingRockID = this.id;
        this.playerID = player.id;

        if (sendPackets) {
            Packets.writeCarryRockPacket(this.id, player.id);
        }
    }

    release(sendPackets) {
        if (sendPackets) {
            Packets.writeDropRockPacket(this.id, this.position);
        }

        const player = EntityInformation.getEntity(this.playerID);
        if (player) {
            player.carryingRockID = 0;
        }
        this.playerID = 0;
    }

    consume(broadcast) {
        const player = EntityInformation.getEntity(this.playerID);
        if (player) {
            player.carryingRockID = 0;
        }
        this.playerID = 0;

        this.destroy();

        if (broadcast) {
            Packets.writeConsumeStonePacket(this.id);
        }
    }

    destroy() {
        this.sprite.destroy();
        this.shadowSprite.destroy();

        RockManager.removeRock(this.id);
    }
}