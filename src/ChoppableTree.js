class ChoppableTree {
    static TEXTURE1 = PIXI.Texture.from('assets/palm-tree-1.png');
    static TEXTURE2 = PIXI.Texture.from('assets/palm-tree-2.png');
    static TEXTURE1_CHOPPED = PIXI.Texture.from('assets/palm-tree-1-chopped.png');
    static TEXTURE2_CHOPPED = PIXI.Texture.from('assets/palm-tree-2-chopped.png');
    static SHADOW_TEXTURE = PIXI.Texture.from('assets/wood-shadow.png');

    id;
    position;
    sprite;
    shadowSprite;

    damage;

    version;

    constructor(id, position) {
        this.id = id;
        this.position = position;

        this.version = Math.floor(Math.random() * 2);

        this.sprite = new PIXI.Sprite(ChoppableTree.getTextures(this.version)[0]);
        this.sprite.filters = [Environment.surfaceColorShader];
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.98;
        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y;
        this.sprite.zIndex = position.y;
        Renderer.abovewaterForeground.addChild(this.sprite);
        this.shadowSprite = new PIXI.Sprite(ChoppableTree.SHADOW_TEXTURE);
        this.shadowSprite.filters = [Environment.surfaceColorShader];
        this.shadowSprite.anchor.x = 0.5;
        this.shadowSprite.anchor.y = 0.8;
        this.shadowSprite.position.x = position.x;
        this.shadowSprite.position.y = position.y;
        Renderer.abovewaterShadows.addChild(this.shadowSprite);

        CullOptimizer.addPermanentSpriteAfterSetup(this.sprite);
        CullOptimizer.addPermanentSpriteAfterSetup(this.shadowSprite);

        this.damage = 0;
    }

    spawnWood(player) {
        const woodAmount = Math.floor(Math.random() * 3) + 2;

        // drop wood
        for (let i = 0; i < woodAmount; i++) {
            const wood = WoodManager.addWood(this.id, this.position);
            Packets.writeSpawnWoodPacket(this.id, wood.id, player.id, wood.angle, wood.speed, wood.heightSpeed);
        }
    }

    chopped() {
        this.sprite.texture = ChoppableTree.getTextures(this.version)[1];
        this.damage = 6;
    }

    hit(player) {
        this.damage += 1;

        if (this.damage === 5) {
            this.chopped();
            this.spawnWood(player);
        }
    }

    static getTextures(version) {
        if (version === 0) {
            return [ChoppableTree.TEXTURE1, ChoppableTree.TEXTURE1_CHOPPED];
        } else {
            return [ChoppableTree.TEXTURE2, ChoppableTree.TEXTURE2_CHOPPED];
        }
    }
}