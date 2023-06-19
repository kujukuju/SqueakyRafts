class HoleB {
    static TEXTURES = [
        PIXI.Texture.from('assets/holeb1.png'),
        PIXI.Texture.from('assets/holeb2.png'),
        PIXI.Texture.from('assets/holeb3.png'),
    ];

    constructor(position) {
        for (let i = 0; i < HoleB.TEXTURES.length; i++) {
            const invertedIndex = HoleB.TEXTURES.length - i - 1;
            const sprite = new BetterParallaxSprite(HoleB.TEXTURES[invertedIndex], invertedIndex * 0.08);
            sprite.position.x = position.x;
            sprite.position.y = position.y;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            Renderer.underwaterBackground.addChild(sprite);

            ParallaxManager.addParallaxSprite(sprite);
        }
    }
}