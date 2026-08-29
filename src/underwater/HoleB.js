class HoleB {
    static LAYERS = [
        ['assets/holeb1.png', 1050, 1050],
        ['assets/holeb2.png', 1050, 1050],
        ['assets/holeb3.png', 1050, 1050],
    ];

    constructor(position) {
        for (let i = 0; i < HoleB.LAYERS.length; i++) {
            const invertedIndex = HoleB.LAYERS.length - i - 1;
            const layer = HoleB.LAYERS[invertedIndex];
            const sprite = new BetterParallaxSprite(PIXI.Texture.EMPTY, invertedIndex * 0.08);
            sprite.width = layer[1];
            sprite.height = layer[2];
            sprite.lazyTexturePath = layer[0];
            sprite.position.x = position.x;
            sprite.position.y = position.y;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            Renderer.underwaterBackground.addChild(sprite);

            ParallaxManager.addParallaxSprite(sprite);
        }
    }
}