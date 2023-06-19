class Kelp extends PIXI.Sprite {
    static TEXTURES = [
        PIXI.Texture.from('assets/kelp1.png'),
        PIXI.Texture.from('assets/kelp2.png'),
    ];

    constructor() {
        super(Kelp.getRandomTexture());

        this.anchor.x = 0.5;
        this.anchor.y = 1.0;

        // this.tint = 0x757db0;

        Renderer.underwaterDecor.addChild(this);
    }

    static getRandomTexture() {
        const ran = Math.random();
        if (ran < 0.5) {
            return Kelp.TEXTURES[0];
        } else {
            return Kelp.TEXTURES[1];
        }
    }
}