class RaftPart {
    static TEXTURE = PIXI.Texture.from('assets/raft-parts-sheet.png');
    static TEXTURES = [
        new PIXI.Texture(RaftPart.TEXTURE, new PIXI.Rectangle(0, 0, 34, 34)),
        new PIXI.Texture(RaftPart.TEXTURE, new PIXI.Rectangle(34, 0, 34, 34)),
        new PIXI.Texture(RaftPart.TEXTURE, new PIXI.Rectangle(68, 0, 34, 34)),
        new PIXI.Texture(RaftPart.TEXTURE, new PIXI.Rectangle(0, 34, 34, 34)),
        new PIXI.Texture(RaftPart.TEXTURE, new PIXI.Rectangle(34, 34, 34, 34)),
        new PIXI.Texture(RaftPart.TEXTURE, new PIXI.Rectangle(68, 34, 34, 34)),
    ];

    underwaterContainer;
    container;
    sprites;

    offsetX;
    offsetY;

    constructor(parentPosition, parentRotation, offsetX, offsetY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.underwaterContainer = new PIXI.Container();
        this.underwaterContainer.filters = [Environment.interactableColorShader];
        Renderer.underwaterForeground.addChild(this.underwaterContainer);

        this.container = new PIXI.Container();
        this.container.filters = [Environment.interactableColorShader];
        Renderer.abovewaterRaft.addChild(this.container);

        this.sprites = [];

        for (let i = RaftPart.TEXTURES.length - 1; i >= 0; i--) {
            const sprite = new PIXI.Sprite(RaftPart.TEXTURES[i]);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            sprite.position.y = i;
            if (i >= 3) {
                this.underwaterContainer.addChild(sprite);
            } else {
                this.container.addChild(sprite);
            }
            this.sprites.push(sprite);
        }

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
        this.setRotation(parentRotation);
    }

    getRotation() {
        return this.sprites[0].rotation;
    }

    setRotation(angle) {
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].rotation = angle;
        }
    }

    getPosition() {
        return new Vec2(this.container.position.x, this.container.position.y);
    }

    setPosition(position) {
        this.container.position.x = position.x;
        this.container.position.y = position.y;
        this.container.zIndex = position.y;
        this.underwaterContainer.position.x = position.x;
        this.underwaterContainer.position.y = position.y;
        this.underwaterContainer.zIndex = position.y;
    }

    isOnPart(position) {
        if (!this.sprites.length) {
            return false;
        }

        const dx = position.x - this.container.position.x;
        const dy = position.y - this.container.position.y;
        const radians = this.sprites[0].rotation;
    
        const rotatedDX = dx * Math.cos(-radians) - dy * Math.sin(-radians);
        const rotatedDY = dy * Math.cos(-radians) + dx * Math.sin(-radians);

        const halfWidth = 16 + Raft.VPADDING;

        return rotatedDX <= halfWidth && rotatedDX >= -halfWidth && rotatedDY <= halfWidth && rotatedDY >= -halfWidth;
    }

    destroy() {
        this.container.destroy({children: true});
        this.underwaterContainer.destroy({children: true});
    }
}