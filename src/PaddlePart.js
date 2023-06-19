class PaddlePart {
    static TEXTURE = PIXI.Texture.from('assets/paddle.png');

    sprite;

    offsetX;
    offsetY;

    localDirection;

    paddling;

    audio;

    constructor(parentPosition, parentRotation, offsetX, offsetY, localDirection) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.sprite = new FramedSprite(PaddlePart.TEXTURE, 44, 34, 6, 36);
        this.sprite.filters = [Environment.interactableColorShader];
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 1;
        this.sprite.addAnimation('idle-left', 0, 1);
        this.sprite.addAnimation('idle-right', 1, 1);
        this.sprite.addAnimation('idle-up', 2, 1);
        this.sprite.addAnimation('idle-down', 3, 1);
        this.sprite.addAnimation('row-left', 4, 8);
        this.sprite.addAnimation('row-right', 12, 8);
        this.sprite.addAnimation('row-up', 20, 8);
        this.sprite.addAnimation('row-down', 28, 8);
        linkAll(this.sprite, ['row-left', 'row-right', 'row-up', 'row-down']);
        Renderer.abovewaterForeground.addChild(this.sprite);

        this.paddling = false;

        this.audio = AudioInformation.paddle.create();

        this.localDirection = Vec2.copy(localDirection);
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

        const offset = Vec2.copy(this.localDirection).rotate(parentRotation).mul(16);
        vec.add(offset);

        this.audio.setPannerPosition(vec.x * AudioInformation.SCALE, vec.y * AudioInformation.SCALE, 0);
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
    }

    setPaddling(paddling) {
        if (paddling && !this.paddling) {
            this.audio.play();
            this.audio.setLoop(true);
        } else if (!paddling && this.paddling) {
            this.audio.stop();
        }

        this.paddling = paddling;
    }

    updateDirection(parentRotation) {
        const direction = Raft.closestDirection(this.localDirection.atan2() + parentRotation);
        if (direction.x === -1) {
            if (this.paddling) {
                this.sprite.stepAnimation('row-left', 0.2, true);
            } else {
                this.sprite.gotoAnimation('idle-left', 0);
            }
            this.sprite.anchor.x = 0.6;
            this.sprite.anchor.y = 0.8;
        } else if (direction.x === 1) {
            if (this.paddling) {
                this.sprite.stepAnimation('row-right', 0.2, true);
            } else {
                this.sprite.gotoAnimation('idle-right', 0);
            }
            this.sprite.anchor.x = 0.28;
            this.sprite.anchor.y = 0.8;
        } else if (direction.y === -1) {
            if (this.paddling) {
                this.sprite.stepAnimation('row-up', 0.2, true);
            } else {
                this.sprite.gotoAnimation('idle-up', 0);
            }
            this.sprite.anchor.x = 0.38;
            this.sprite.anchor.y = 0.8;
        } else if (direction.y === 1) {
            if (this.paddling) {
                this.sprite.stepAnimation('row-down', 0.2, true);
            } else {
                this.sprite.gotoAnimation('idle-down', 0);
            }
            this.sprite.anchor.x = 0.45;
            this.sprite.anchor.y = 0.7;
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
        this.audio.stop();
    }
}