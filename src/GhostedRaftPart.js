class GhostedRaftPart {
    container;
    sprites;

    position;
    rotation;

    constructor(position, rotation) {
        this.position = Vec2.copy(position);
        this.rotation = rotation;

        this.container = new PIXI.Container();
        // this.container.alpha = 0.2;
        this.container.filters = [Environment.interactableColorShader];
        Renderer.abovewaterRaft.addChild(this.container);

        this.sprites = [];

        for (let i = RaftPart.TEXTURES.length - 1; i >= 0; i--) {
            const sprite = new PIXI.Sprite(RaftPart.TEXTURES[i]);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            sprite.position.y = i;
            this.container.addChild(sprite);
            this.sprites.push(sprite);
        }
    }

    update(position, rotation) {
        const nearbySpace = RaftManager.getNearbyAvailableOffsets(position);
        if (nearbySpace) {
            const raft = nearbySpace[0];
            const offsetX = nearbySpace[1].x;
            const offsetY = nearbySpace[1].y;

            position = raft.getPositionFromOffsets(offsetX, offsetY);
            rotation = raft.rotation;
        }

        this.position.copy(position);
        this.rotation = rotation;

        this.container.position.x = position.x;
        this.container.position.y = position.y;

        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].rotation = rotation;
        }

        const valid = IslandManager.isSwimming(position);
        if (valid) {
            for (let i = 0; i < this.sprites.length; i++) {
                this.sprites[i].tint = 0x0f9f00;
            }


        } else {
            for (let i = 0; i < this.sprites.length; i++) {
                this.sprites[i].tint = 0xa90000;
            }
        }

        if (valid && (Input.keys[Input.KEY_E] & Input.DELTA_DOWN)) {
            const entity = EntityInformation.getClientEntity();
            if (entity.carryingWoodID) {
                const wood = WoodManager.getWood(entity.carryingWoodID);
                if (wood) {
                    wood.consume(true);

                    if (nearbySpace) {
                        const raft = nearbySpace[0];
                        const offsetX = nearbySpace[1].x;
                        const offsetY = nearbySpace[1].y;

                        raft.addPart(offsetX, offsetY, true);
                    } else {
                        RaftManager.addRaft(this.position, true);
                    }
                }
            }
        }
    }

    destroy() {
        this.container.destroy({children: true});
    }
}