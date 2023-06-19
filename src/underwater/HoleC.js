class HoleC {
    static TEXTURES = [
        PIXI.Texture.from('assets/holec1.png'),
        PIXI.Texture.from('assets/holec2.png'),
        PIXI.Texture.from('assets/holec3.png'),
    ];

    constructor(position) {
        for (let i = 0; i < HoleC.TEXTURES.length; i++) {
            const invertedIndex = HoleC.TEXTURES.length - i - 1;
            const sprite = new BetterParallaxSprite(HoleC.TEXTURES[invertedIndex], invertedIndex * 0.08);
            sprite.position.x = position.x;
            sprite.position.y = position.y;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            Renderer.underwaterBackground.addChild(sprite);

            ParallaxManager.addParallaxSprite(sprite);
        }
    }
}