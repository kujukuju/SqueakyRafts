class GhostedPaddlePart {
    sprite;

    position;
    direction;

    constructor(position, direction) {
        this.position = Vec2.copy(position);
        this.direction = Vec2.copy(direction);

        this.sprite = new FramedSprite(PaddlePart.TEXTURE, 44, 34, 6, 36);
        this.sprite.filters = [Environment.interactableColorShader];
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 1;
        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y;
        this.sprite.addAnimation('idle-left', 0, 1);
        this.sprite.addAnimation('idle-right', 1, 1);
        this.sprite.addAnimation('idle-up', 2, 1);
        this.sprite.addAnimation('idle-down', 3, 1);
        Renderer.abovewaterForeground.addChild(this.sprite);

        this.updateDirection(direction);
    }

    update(position, direction) {
        let localDirection = null;
        const nearbySpace = RaftManager.getNearbyOccupiedButEmptyOffsets(position);
        if (nearbySpace) {
            const raft = nearbySpace[0];
            const offsetX = nearbySpace[1].x;
            const offsetY = nearbySpace[1].y;

            localDirection = Raft.closestDirection(direction.atan2() - raft.rotation);
            direction = Raft.closestDirection(localDirection.atan2() + raft.rotation);

            position = raft.getPositionFromOffsets(offsetX, offsetY);
            position.add(Vec2.copy(localDirection).rotate(raft.rotation).mul(16));
        }

        this.position.copy(position);

        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y;

        // there should be no part where the paddle is facing
        let valid = false;
        if (nearbySpace && localDirection) {
            const raft = nearbySpace[0];
            const offsetX = nearbySpace[1].x;
            const offsetY = nearbySpace[1].y;
            valid = !raft.getPartAtOffset(offsetX + localDirection.x, offsetY + localDirection.y);
        }

        if (valid) {
            this.sprite.tint = 0x0f9f00;
        } else {
            this.sprite.tint = 0xa90000;
        }

        this.updateDirection(direction);

        if (valid && (Input.keys[Input.KEY_E] & Input.DELTA_DOWN)) {
            const entity = EntityInformation.getClientEntity();
            if (entity.carryingWoodID) {
                const wood = WoodManager.getWood(entity.carryingWoodID);
                if (wood) {
                    wood.consume(true);

                    const raft = nearbySpace[0];
                    const offsetX = nearbySpace[1].x;
                    const offsetY = nearbySpace[1].y;

                    raft.addPaddle(offsetX, offsetY, true, localDirection);
                }
            }
        }
    }

    updateDirection(direction) {
        if (direction.x === -1) {
            this.sprite.gotoAnimation('idle-left', 0);
            this.sprite.anchor.x = 0.6;
            this.sprite.anchor.y = 0.8;
        } else if (direction.x === 1) {
            this.sprite.gotoAnimation('idle-right', 0);
            this.sprite.anchor.x = 0.28;
            this.sprite.anchor.y = 0.8;
        } else if (direction.y === -1) {
            this.sprite.gotoAnimation('idle-up', 0);
            this.sprite.anchor.x = 0.38;
            this.sprite.anchor.y = 0.8;
        } else if (direction.y === 1) {
            this.sprite.gotoAnimation('idle-down', 0);
            this.sprite.anchor.x = 0.45;
            this.sprite.anchor.y = 0.7;
        }
    }

    destroy() {
        this.sprite.destroy({children: true});
    }
}