class HoleA {
    static TEXTURES = [
        PIXI.Texture.from('assets/hole1.png'),
        PIXI.Texture.from('assets/hole2.png'),
        PIXI.Texture.from('assets/hole3.png'),
        PIXI.Texture.from('assets/hole4.png'),
    ];

    constructor(position) {
        for (let i = 0; i < HoleA.TEXTURES.length; i++) {
            const invertedIndex = HoleA.TEXTURES.length - i - 1;
            const sprite = new BetterParallaxSprite(HoleA.TEXTURES[invertedIndex], invertedIndex * 0.08);
            sprite.position.x = position.x;
            sprite.position.y = position.y;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            Renderer.underwaterBackground.addChild(sprite);

            ParallaxManager.addParallaxSprite(sprite);
        }
    }
}