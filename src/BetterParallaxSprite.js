class BetterParallaxSprite extends PIXI.Sprite {
    speed;
    oldPosition;
    realPosition;

    constructor(texture, speed) {
        super(texture);
        
        this.speed = speed;
        this.oldPosition = new Vec2();
        this.realPosition = new Vec2();
    }

    update() {
        if (this.oldPosition.x !== this.position.x || this.oldPosition.y !== this.position.y) {
            this.realPosition.copy(this.position);
        }

        const cameraX = Camera.aabb.x + Camera.aabb.width / 2;
        const cameraY = Camera.aabb.y + Camera.aabb.height / 2;

        const dx = (this.realPosition.x - cameraX) * this.speed;
        const dy = (this.realPosition.y - cameraY) * this.speed;

        this.position.x = this.realPosition.x - dx;
        this.position.y = this.realPosition.y - dy;

        this.oldPosition.copy(this.position);

        cullSprite(this);
    }
}