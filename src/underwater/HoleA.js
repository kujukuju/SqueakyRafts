class HoleA {
    static LAYERS = [
        ['assets/hole1.png', 2200, 2200],
        ['assets/hole2.png', 1640, 1640],
        ['assets/hole3.png', 1560, 1560],
        ['assets/hole4.png', 1440, 1440],
    ];

    constructor(position) {
        for (let i = 0; i < HoleA.LAYERS.length; i++) {
            const invertedIndex = HoleA.LAYERS.length - i - 1;
            const layer = HoleA.LAYERS[invertedIndex];
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