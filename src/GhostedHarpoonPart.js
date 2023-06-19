class GhostedHarpoonPart {
    sprite;

    position;
    direction;

    constructor(position, direction) {
        this.position = Vec2.copy(position);
        this.direction = Vec2.copy(direction);

        this.sprite = new FramedSprite(HarpoonPart.TEXTURE, 38, 56, 13, 52);
        this.sprite.filters = [Environment.interactableColorShader];
        this.sprite.anchor.x = 20 / 38;
        this.sprite.anchor.y = 34 / 56;
        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y;
        this.sprite.addAnimation('idle-down', 48, 1);
        this.sprite.addAnimation('idle-left', 49, 1);
        this.sprite.addAnimation('idle-right', 50, 1);
        this.sprite.addAnimation('idle-up', 51, 1);
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
            // position.add(Vec2.copy(localDirection).rotate(raft.rotation).mul(16));
        }

        this.position.copy(position);

        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y;

        // there should be no part where the paddle is facing
        let valid = false;
        if (nearbySpace && localDirection) {
            valid = true;
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

                    raft.addHarpoon(offsetX, offsetY, true, localDirection);
                }
            }
        }
    }

    updateDirection(direction) {
        if (direction.x === -1) {
            this.sprite.gotoAnimation('idle-left', 0);
        } else if (direction.x === 1) {
            this.sprite.gotoAnimation('idle-right', 0);
        } else if (direction.y === -1) {
            this.sprite.gotoAnimation('idle-up', 0);
        } else if (direction.y === 1) {
            this.sprite.gotoAnimation('idle-down', 0);
        }
    }

    destroy() {
        this.sprite.destroy({children: true});
    }
}