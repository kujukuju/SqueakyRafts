class CullOptimizer {
    static visibleSprites = [];
    static tree = new box2d.b2DynamicTree();

    static addPermanentSpriteAfterSetup(sprite) {
        const minX = sprite.position.x - sprite.width * sprite.anchor.x;
        const minY = sprite.position.y - sprite.height * sprite.anchor.y;
        const maxX = sprite.position.x + sprite.width * (1 - sprite.anchor.x);
        const maxY = sprite.position.y + sprite.height * (1 - sprite.anchor.y);

        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = minX;
        aabb.lowerBound.y = minY;
        aabb.upperBound.x = maxX;
        aabb.upperBound.y = maxY;

        sprite.visible = false;

        CullOptimizer.tree.CreateProxy(aabb, sprite);
    }

    static update() {
        const screenAABB = new box2d.b2AABB();
        screenAABB.lowerBound.x = Camera.aabb.x;
        screenAABB.lowerBound.y = Camera.aabb.y;
        screenAABB.upperBound.x = Camera.aabb.x + Camera.aabb.width;
        screenAABB.upperBound.y = Camera.aabb.y + Camera.aabb.height;

        for (let i = 0; i < CullOptimizer.visibleSprites.length; i++) {
            CullOptimizer.visibleSprites[i].visible = false;
        }
        CullOptimizer.visibleSprites.length = 0;

        CullOptimizer.tree.Query(node => {
            const sprite = node.userData;
            sprite.visible = true;
            CullOptimizer.visibleSprites.push(sprite);
            return true;
        }, screenAABB);
    }
}