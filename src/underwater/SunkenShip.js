class SunkenShip extends PIXI.Sprite {
    static TEXTURE = PIXI.Texture.from('assets/sunken-ship.png');

    constructor() {
        super(SunkenShip.TEXTURE);

        this.anchor.x = 0.5;
        this.anchor.y = 1.0;

        Renderer.underwaterDecor.addChild(this);
    }
}