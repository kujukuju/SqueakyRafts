class PinkSponge extends PIXI.Sprite {
    static TEXTURES = [
        PIXI.Texture.from('assets/coral1.png'),
        PIXI.Texture.from('assets/coral2.png'),
        PIXI.Texture.from('assets/coral4.png'),
    ];

    constructor() {
        super(PinkSponge.getRandomTexture());

        this.anchor.x = 0.5;
        this.anchor.y = 1.0;

        Renderer.underwaterDecor.addChild(this);
    }

    static getRandomTexture() {
        const ran = Math.random();
        if (ran < 0.333) {
            return PinkSponge.TEXTURES[0];
        } else if (ran < 0.667) {
            return PinkSponge.TEXTURES[1];
        } else {
            return PinkSponge.TEXTURES[2];
        }
    }
}