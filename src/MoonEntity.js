class MoonEntity extends VoiceEntity {
    static TEXTURE = PIXI.Texture.from('assets/moon-2.png');
    static HEAD_TEXTURE = PIXI.Texture.from('assets/moon-head.png');
    static SHADOW_TEXTURE = PIXI.Texture.from('assets/wood-shadow.png');
    static WELCOME_TEXTURE = PIXI.Texture.from('assets/welcome-text.png');

    id;
    sprite;
    headSprite;
    shadowSprite;

    position_;
    velocity_;
    groundVelocity;

    rareWriteTick;

    lastFiredTime;

    welcomeSprite;

    constructor(client) {
        super();

        this.sprite = new FramedSprite(MoonEntity.TEXTURE, 38, 57, 16, 173);
        if (!client) this.sprite.filters = [Environment.interactableColorShader];
        this.sprite.anchor.x = 19 / 36;
        this.sprite.anchor.y = 47 / 55;
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
        this.sprite.addAnimation('shoot-front', 104, 9);
        this.sprite.addAnimation('shoot-left', 113, 9);
        this.sprite.addAnimation('shoot-right', 122, 9);
        this.sprite.addAnimation('shoot-back', 131, 9);
        this.sprite.addAnimation('swim-front', 140, 4);
        this.sprite.addAnimation('swim-left', 144, 4);
        this.sprite.addAnimation('swim-right', 148, 4);
        this.sprite.addAnimation('swim-back', 152, 4);
        this.sprite.addAnimation('paddle-front', 156, 3);
        this.sprite.addAnimation('paddle-left', 159, 3);
        this.sprite.addAnimation('paddle-right', 162, 3);
        this.sprite.addAnimation('paddle-back', 165, 3);
        this.sprite.addAnimation('interact-front', 168, 1);
        this.sprite.addAnimation('interact-left', 169, 1);
        this.sprite.addAnimation('interact-right', 170, 1);
        this.sprite.addAnimation('interact-back', 171, 1);
        this.sprite.addAnimation('dead', 171, 1);
        linkAll(this.sprite, ['walk-front', 'walk-left', 'walk-right', 'walk-back']);
        linkAll(this.sprite, ['holding-walk-front', 'holding-walk-left', 'holding-walk-right', 'holding-walk-back']);
        linkAll(this.sprite, ['punch-front', 'punch-left', 'punch-right', 'punch-back']);
        linkAll(this.sprite, ['shoot-front', 'shoot-left', 'shoot-right', 'shoot-back']);
        linkAll(this.sprite, ['swim-front', 'swim-left', 'swim-right', 'swim-back']);
        linkAll(this.sprite, ['paddle-front', 'paddle-left', 'paddle-right', 'paddle-back']);
        Renderer.abovewaterForeground.addChild(this.sprite);

        this.headSprite = new FramedSprite(MoonEntity.HEAD_TEXTURE, 38, 57, 4, 16);
        if (!client) this.headSprite.filters = [Environment.interactableColorShader];
        this.headSprite.anchor.x = this.sprite.anchor.x;
        this.headSprite.anchor.y = this.sprite.anchor.y;
        this.headSprite.addAnimation('swim-front', 0, 4);
        this.headSprite.addAnimation('swim-left', 4, 4);
        this.headSprite.addAnimation('swim-right', 8, 4);
        this.headSprite.addAnimation('swim-back', 12, 4);
        Renderer.abovewaterForeground.addChild(this.headSprite);

        this.shadowSprite = new PIXI.Sprite(MoonEntity.SHADOW_TEXTURE);
        this.shadowSprite.anchor.x = 0.5;
        this.shadowSprite.anchor.y = 0.75;
        Renderer.abovewaterShadows.addChild(this.shadowSprite);

        this.welcomeSprite = new PIXI.Sprite(MoonEntity.WELCOME_TEXTURE);
        this.welcomeSprite.position.x = 2872;
        this.welcomeSprite.position.y = 10835;
        this.welcomeSprite.anchor.x = 0.5;
        this.welcomeSprite.anchor.y = 1.4;
        this.welcomeSprite.alpha = 1;
        this.welcomeSprite.scale.x = 1.0 / 3.0;
        this.welcomeSprite.scale.y = 1.0 / 3.0;
        this.welcomeSprite.zIndex = 10835;
        Renderer.abovewaterForeground.addChild(this.welcomeSprite);

        this.position_ = new Vec2();
        this.velocity_ = new Vec2();
        this.groundVelocity = new Vec2();

        this.rareWriteTick = 0;
        this.lastFiredTime = 0;
    }

    update() {
        this.position_.x = 2872;
        this.position_.y = 10835;

        const previousCarrying = this.carryingWoodID || this.carryingRockID || this.carryingDeadPlebID;
        super.update();

        const currentlyCarrying = this.carryingWoodID || this.carryingRockID || this.carryingDeadPlebID;

        if (this.holdingPlayerID) {
            if (!EntityInformation.hasEntity(this.holdingPlayerID)) {
                this.holdingPlayerID = 0;
            }
        }

        if (EntityInformation.getClientEntity() && EntityInformation.getClientEntity().getPosition().distance(this.getPosition()) < 100) {
            this.welcomeSprite.alpha = Math.min(this.welcomeSprite.alpha + 0.1, 1);
        } else {
            this.welcomeSprite.alpha = Math.max(this.welcomeSprite.alpha - 0.1, 0);
        }

        if (EntityInformation.getClientEntity() === this) {
            if (Input.keys[Input.KEY_F] & Input.DELTA_DOWN) {
                if (this.holdingPlayerID) {
                    const pleb = EntityInformation.getEntity(this.holdingPlayerID);
                    if (pleb) {
                        const direction = new Vec2();
                        if (this.animLeft) direction.x = -1;
                        if (this.animRight) direction.x = 1;
                        if (this.animUp) direction.y = -1;
                        if (this.animDown) direction.y = 1;
                        // send released pleb packet
                        direction.mul(8).add(this.getVelocity());

                        pleb.beingCarried = false;
                        pleb.carryReleasedTime = Loop.time;

                        const position = this.getPosition();
                        Packets.writeReleasePlebPacket(this.id, pleb.id, position.x, position.y, direction.x, direction.y);
                    }

                    this.holdingPlayerID = 0;
                } else {
                    if (!previousCarrying && !currentlyCarrying) {
                        const potentialPleb = EntityInformation.getPlebEntityNearPosition(this.getFrontPoint()) || EntityInformation.getPlebEntityNearPosition(this.getPosition());
                        if (potentialPleb) {
                            this.holdingPlayerID = potentialPleb.id;
                        }
                    }
                }
            }

            if (this.holdingPlayerID) {
                const pleb = EntityInformation.getEntity(this.holdingPlayerID);
                if (pleb) {
                    pleb.beingCarried = true;
                    // send holding pleb packet
                    const position = this.getPosition();
                    const velocity = this.getVelocity();
                    Packets.writeHoldingPlebPacket(this.id, pleb.id, position.x, position.y, velocity.x, velocity.y);
                }
            }

            if (this.downed) {
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
            } else {
                if (!this.carryingRockID && !this.carryingWoodID && !this.carryingDeadPlebID && !this.holdingPlayerID && !this.interactingRaftID) {
                    if (Input.mouseDownRight) {
                        this.aiming = true;
                    }
                }
            }

            if (this.aiming && !Input.mouseDownRight) {
                this.aiming = false;
            }
            
            if (this.aiming) {
                const pos = this.getPosition();
                this.aimDirection.copy(Camera.getMousePosition()).sub(pos).normalize();

                if ((Input.mouseDownLeft & Input.DELTA_DOWN) && Loop.time - this.lastFiredTime > 500) {
                    this.lastFiredTime = Loop.time;
                    Packets.writeFiredBulletPacket(pos.x, pos.y, this.aimDirection.x, this.aimDirection.y);
                    GunBulletManager.addBullet(pos, this.aimDirection);
                }
            }
        }

        if (this.holdingPlayerID) {
            const pleb = EntityInformation.getEntity(this.holdingPlayerID);
            if (pleb) {
                pleb.setInterpolatedPositionVelocity(this.getPosition(), this.getVelocity());
            }
        }

        this.position_.x = 2872;
        this.position_.y = 10835;
    }

    sendPackets() {
        Packets.writeMoonPacket(this.id, true);
        Packets.writeMoonDownPacket(this.id, this.downed);

        if (this.aiming !== this.oldAiming) {
            this.oldAiming = this.aiming;
            Packets.writeAimingPacket(this.aiming);
        }
        if (this.aiming) {
            Packets.writeAimingDirectionPacket(this.aimDirection.x, this.aimDirection.y);
        }

        this.rareWriteTick = (this.rareWriteTick + 1) % 600;
        if (this.rareWriteTick === 0) {
            RaftManager.writeRaftCreatePackets();
        }
        RaftManager.writeSyncRaftPackets();
        WoodManager.writePositionPackets();
        RockManager.writePositionPackets();
        PlebDeathManager.writePositionPackets();
        SharkManager.sendPackets();

        const spawnIsland = IslandManager.getClosestIslandFarRight(this.getPosition());
        if (spawnIsland !== null) {
            Packets.writeSetSpawnIslandPacket(spawnIsland);
        }

        super.sendPackets();
    }

    updateAnimation() {
        const updated = super.updateAnimation();
        if (updated) {
            return;
        }

        // update shooting?
        if (this.downed) {
            this.sprite.gotoAnimation('dead', 0);
        } else if (this.aiming) {
            if (Loop.time - this.lastFiredTime <= 500) {
                const progress = Math.min((Loop.time - this.lastFiredTime) / 250, 0.99999);
                if (Math.abs(this.aimDirection.x) > Math.abs(this.aimDirection.y)) {
                    if (this.aimDirection.x < 0) {
                        this.sprite.gotoAnimation('shoot-left', progress * 3 + 6);
                    } else {
                        this.sprite.gotoAnimation('shoot-right', progress * 3 + 6);
                    }
                } else {
                    if (this.aimDirection.y < 0) {
                        this.sprite.gotoAnimation('shoot-back', progress * 3 + 6);
                    } else {
                        this.sprite.gotoAnimation('shoot-front', progress * 3 + 6);
                    }
                }
            } else {
                if (Math.abs(this.aimDirection.x) > Math.abs(this.aimDirection.y)) {
                    if (this.aimDirection.x < 0) {
                        this.sprite.gotoAnimation('shoot-left', 0);
                    } else {
                        this.sprite.gotoAnimation('shoot-right', 0);
                    }
                } else {
                    if (this.aimDirection.y < 0) {
                        this.sprite.gotoAnimation('shoot-back', 0);
                    } else {
                        this.sprite.gotoAnimation('shoot-front', 0);
                    }
                }
            }
        }
    }

    render() {
        super.render();
    }

    getHeight() {
        return 40;
    }

    bit() {
        if (EntityInformation.getClientEntity() === this) {
            DeathScreen.showFaded();
        }

        this.downed = true;
    }

    destroy() {
        super.destroy();

        this.sprite.destroy();
        this.headSprite.destroy();
        this.shadowSprite.destroy();
    }
}