class ParallaxManager {
    static parallaxSprites = [];

    static update() {
        for (let i = 0; i < this.parallaxSprites.length; i++) {
            this.parallaxSprites[i].update();
        }
    }

    static addParallaxSprite(sprite) {
        this.parallaxSprites.push(sprite);
    }
}