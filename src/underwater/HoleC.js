class HoleC {
    static LAYERS = [
        ['assets/holec1.png', 1600, 1600],
        ['assets/holec2.png', 1600, 1600],
        ['assets/holec3.png', 1600, 1600],
    ];

    constructor(position) {
        for (let i = 0; i < HoleC.LAYERS.length; i++) {
            const invertedIndex = HoleC.LAYERS.length - i - 1;
            const layer = HoleC.LAYERS[invertedIndex];
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