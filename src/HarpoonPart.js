class HarpoonPart {
    static TEXTURE = PIXI.Texture.from('assets/harpoon.png');

    sprite;

    offsetX;
    offsetY;

    localDirection;

    shooting;

    moonControlled;
    plebControlled;

    hasRock;

    ammoSprites;

    lastShotTime;

    constructor(parentPosition, parentRotation, offsetX, offsetY, localDirection) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.sprite = new FramedSprite(HarpoonPart.TEXTURE, 38, 56, 13, 52);
        this.sprite.filters = [Environment.interactableColorShader];
        this.sprite.anchor.x = 20 / 38;
        this.sprite.anchor.y = 34 / 56;
        this.sprite.addAnimation('moon-idle-down', 0, 1);
        this.sprite.addAnimation('moon-idle-left', 6, 1);
        this.sprite.addAnimation('moon-idle-right', 12, 1);
        this.sprite.addAnimation('moon-idle-up', 18, 1);
        this.sprite.addAnimation('moon-fire-down', 0, 6);
        this.sprite.addAnimation('moon-fire-left', 6, 6);
        this.sprite.addAnimation('moon-fire-right', 12, 6);
        this.sprite.addAnimation('moon-fire-up', 18, 6);
        this.sprite.addAnimation('pleb-idle-down', 24, 1);
        this.sprite.addAnimation('pleb-idle-left', 30, 1);
        this.sprite.addAnimation('pleb-idle-right', 36, 1);
        this.sprite.addAnimation('pleb-idle-up', 42, 1);
        this.sprite.addAnimation('pleb-fire-down', 24, 6);
        this.sprite.addAnimation('pleb-fire-left', 30, 6);
        this.sprite.addAnimation('pleb-fire-right', 36, 6);
        this.sprite.addAnimation('pleb-fire-up', 42, 6);
        this.sprite.addAnimation('idle-down', 48, 1);
        this.sprite.addAnimation('idle-left', 49, 1);
        this.sprite.addAnimation('idle-right', 50, 1);
        this.sprite.addAnimation('idle-up', 51, 1);
        linkAll(this.sprite, ['moon-fire-down', 'moon-fire-left', 'moon-fire-right', 'moon-fire-up']);
        linkAll(this.sprite, ['pleb-fire-down', 'pleb-fire-left', 'pleb-fire-right', 'pleb-fire-up']);
        Renderer.abovewaterForeground.addChild(this.sprite);

        this.localDirection = Vec2.copy(localDirection);

        this.shooting = false;

        this.moonControlled = false;
        this.plebControlled = false;

        this.hasRock = false;

        this.ammoSprites = [];

        this.lastShotTime = 0;

        this.updateDirection(parentRotation);

        this.updatePositions(parentPosition, parentRotation, 0);
    }

    update(parentPosition, parentRotation, waveOffset) {
        this.updatePositions(parentPosition, parentRotation, waveOffset);
    }

    updatePositions(parentPosition, parentRotation, waveOffset) {
        const vec = new Vec2(this.offsetX * 32, this.offsetY * 32);
        vec.rotate(parentRotation);
        vec.add(parentPosition);
        vec.y += waveOffset;

        this.setPosition(vec);
        this.updateDirection(parentRotation);
    }

    getPosition() {
        return new Vec2(this.sprite.position.x, this.sprite.position.y);
    }

    setPosition(position) {
        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y;
        this.sprite.zIndex = position.y;

        for (let i = 0; i < this.ammoSprites.length; i++) {
            const ammoSprite = this.ammoSprites[i];

            ammoSprite.x = position.x;
            ammoSprite.y = position.y - 24 - 12 * i;
            ammoSprite.zIndex = position.y + 1;
            cullSprite(ammoSprite);
        }
    }

    setShooting(shooting) {
        this.shooting = shooting;
    }

    fire(raft, direction, broadcast) {
        if (this.ammoSprites.length === 0) {
            return;
        }

        if (broadcast) {
            if (Loop.time - this.lastShotTime <= 500) {
                return;
            }
            this.lastShotTime = Loop.time;
        }

        const position = this.getPosition();
        const cannon = AudioInformation.cannon.create();
        cannon.setPannerPosition(position.x * AudioInformation.SCALE, position.y * AudioInformation.SCALE, 0);
        AudioInformation.playAudio(cannon);

        HarpoonBulletManager.addBullet(raft.id, raft.getPositionFromOffsets(this.offsetX, this.offsetY), direction);
        this.consumeAmmo();

        if (broadcast) {
            Packets.writeFireHarpoonPacket(raft.id, this.offsetX, this.offsetY, direction.x, direction.y);
        }
    }

    setWorldDirection(direction, parentRotation) {
        const localAngle = direction.atan2() - parentRotation;
        this.localDirection.set(Math.cos(localAngle), Math.sin(localAngle));
    }

    setAmmoCount(count) {
        while (this.ammoSprites.length < count) {
            this.loadRock(null, null, false);
        }

        while (this.ammoSprites.length > count) {
            this.consumeAmmo();
        }
    }

    loadRock(raft, entityID, broadcast) {
        const sprite = new PIXI.Sprite(RockObject.TEXTURE1);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.visible = false;
        sprite.alpha = 0.85;
        sprite.tint = 0x99ff77;
        Renderer.abovewaterForeground.addChild(sprite);
        this.ammoSprites.push(sprite);

        if (broadcast) {
            Packets.writeLoadHarpoonPacket(raft.id, entityID, this.offsetX, this.offsetY);
        }
    }

    consumeAmmo() {
        if (this.ammoSprites.length === 0) { 
            return;
        }

        this.ammoSprites[this.ammoSprites.length - 1].destroy();
        this.ammoSprites.length -= 1;
    }

    updateDirection(parentRotation) {
        if (this.sprite.getFrame() > 3) {
            this.shooting = false;
        }

        const shooting = Loop.time - this.lastShotTime < 250;
        const shootingProgress = Math.min((Loop.time - this.lastShotTime) / 250, 0.999);

        const direction = Raft.closestDirection(this.localDirection.atan2() + parentRotation);
        if (direction.x === -1) {
            if (this.moonControlled) {
                if (shooting) {
                    this.sprite.gotoAnimation('moon-fire-left', 3 + shootingProgress * 2);
                } else {
                    this.sprite.gotoAnimation('moon-idle-left', 0);
                }
            } else if (this.plebControlled) {
                if (shooting) {
                    this.sprite.gotoAnimation('pleb-fire-left', 3 + shootingProgress * 2);
                } else {
                    this.sprite.gotoAnimation('pleb-idle-left', 0);
                }
            } else {
                this.sprite.gotoAnimation('idle-left', 0);
            }
        } else if (direction.x === 1) {
            if (this.moonControlled) {
                if (shooting) {
                    this.sprite.gotoAnimation('moon-fire-right', 3 + shootingProgress * 2);
                } else {
                    this.sprite.gotoAnimation('moon-idle-right', 0);
                }
            } else if (this.plebControlled) {
                if (shooting) {
                    this.sprite.gotoAnimation('pleb-fire-right', 3 + shootingProgress * 2);
                } else {
                    this.sprite.gotoAnimation('pleb-idle-right', 0);
                }
            } else {
                this.sprite.gotoAnimation('idle-right', 0);
            }
        } else if (direction.y === -1) {
            if (this.moonControlled) {
                if (shooting) {
                    this.sprite.gotoAnimation('moon-fire-up', 3 + shootingProgress * 2);
                } else {
                    this.sprite.gotoAnimation('moon-idle-up', 0);
                }
            } else if (this.plebControlled) {
                if (shooting) {
                    this.sprite.gotoAnimation('pleb-fire-up', 3 + shootingProgress * 2);
                } else {
                    this.sprite.gotoAnimation('pleb-idle-up', 0);
                }
            } else {
                this.sprite.gotoAnimation('idle-up', 0);
            }
        } else if (direction.y === 1) {
            if (this.moonControlled) {
                if (shooting) {
                    this.sprite.gotoAnimation('moon-fire-down', 3 + shootingProgress * 2);
                } else {
                    this.sprite.gotoAnimation('moon-idle-down', 0);
                }
            } else if (this.plebControlled) {
                if (shooting) {
                    this.sprite.gotoAnimation('pleb-fire-down', 3 + shootingProgress * 2);
                } else {
                    this.sprite.gotoAnimation('pleb-idle-down', 0);
                }
            } else {
                this.sprite.gotoAnimation('idle-down', 0);
            }
        }
    }

    getFacingOffsets() {
        return new Vec2(this.offsetX + this.localDirection.x, this.offsetY + this.localDirection.y);
    }

    getWorldFacingVector(parentRaft) {
        return Vec2.copy(this.localDirection).rotate(parentRaft.rotation);
    }

    destroy() {
        this.sprite.destroy();
    }
}