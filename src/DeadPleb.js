class DeadPleb {
    static TEXTURE = PIXI.Texture.from('assets/little-dude-dead-Sheet.png');
    static DEAD_TEXTURE = new PIXI.Texture(DeadPleb.TEXTURE, new PIXI.Rectangle(0, 0, 26, 14));
    static EATEN_TEXTURE = new PIXI.Texture(DeadPleb.TEXTURE, new PIXI.Rectangle(26, 0, 26, 14));

    id;

    position;
    sprite;
    shadowSprite;

    heightSpeed;
    height;

    playerID;

    underwater;
    oldUnderwater;
    checkUnderwaterFrameCount;

    expireTime;

    onRaft;

    constructor(id, point) {
        this.id = id;

        this.position = Vec2.copy(point);
        this.sprite = new PIXI.Sprite(DeadPleb.DEAD_TEXTURE);
        this.sprite.filters = [Environment.interactableColorShader];
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.position.x = point.x;
        this.sprite.position.y = point.y;
        this.sprite.zIndex = point.y;
        Renderer.abovewaterForeground.addChild(this.sprite);
        this.shadowSprite = new PIXI.Sprite(RockObject.SHADOW_TEXTURE);
        this.shadowSprite.anchor.x = 0.5;
        this.shadowSprite.anchor.y = 0.5;
        this.shadowSprite.position.x = point.x;
        this.shadowSprite.position.y = point.y;
        Renderer.abovewaterShadows.addChild(this.shadowSprite);

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

        this.height = Math.max(this.height + this.heightSpeed, 0);
        this.heightSpeed = this.heightSpeed - 0.3;
        if (this.height === 0 || this.playerID) {
            this.heightSpeed = 0;
        }

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
            player.carryingDeadPlebID = 0;

            return;
        }

        player.carryingDeadPlebID = this.id;
        this.playerID = player.id;

        if (sendPackets) {
            Packets.writeCarryDeadPlebPacket(this.id, player.id);
        }
    }

    release(sendPackets) {
        if (sendPackets) {
            Packets.writeDropDeadPlebPacket(this.id, this.position);
        }

        const player = EntityInformation.getEntity(this.playerID);
        if (player) {
            player.carryingDeadPlebID = 0;
        }
        this.playerID = 0;
    }

    consume(broadcast) {
        const player = EntityInformation.getEntity(this.playerID);
        if (player) {
            player.carryingDeadPlebID = 0;
        }
        this.playerID = 0;

        this.destroy();

        if (broadcast) {
            Packets.writeConsumeDeadPlebPacket(this.id);
        }
    }

    eat(broadcast) {
        this.sprite.texture = DeadPleb.EATEN_TEXTURE;

        const eatAudio = AudioInformation.eat.create();
        eatAudio.setPannerPosition(this.position.x * AudioInformation.SCALE, this.position.y * AudioInformation.SCALE, 0);
        AudioInformation.playAudio(eatAudio);

        if (broadcast) {
            Packets.writeEatDeadPlebPacket(this.id);
        }
    }

    destroy() {
        this.sprite.destroy();
        this.shadowSprite.destroy();

        PlebDeathManager.removeDeadPleb(this.id);
    }
}