class PhysicsManager {
    static dynamicTree = new box2d.b2DynamicTree();

    static update() {
        const clientEntity = EntityInformation.getClientEntity();
        if (!clientEntity) {
            return;
        }

        const entityPosition = clientEntity.getPosition();

        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = entityPosition.x;
        aabb.lowerBound.y = entityPosition.y;
        aabb.upperBound.x = entityPosition.x;
        aabb.upperBound.y = entityPosition.y;

        let maxDist = 0;
        let maxCollisionPoint = null;
        PhysicsManager.dynamicTree.Query(node => {
            const polygon = node.userData;

            if (MathHelper.isPointInPolygon(polygon, entityPosition)) {
                const nearestEdgePoint = MathHelper.nearestPointOnPolygonEdge(polygon, entityPosition);
                if (nearestEdgePoint) {
                    const nearestEdgeDistSquared = nearestEdgePoint.distanceSquared(entityPosition);
                    if (nearestEdgeDistSquared > maxDist) {
                        maxDist = nearestEdgeDistSquared;
                        maxCollisionPoint = nearestEdgePoint;
                    }
                }
            }

            return true;
        }, aabb);

        if (maxCollisionPoint) {
            clientEntity.setPosition(maxCollisionPoint);
        }
    }

    static addPolygon(polygon) {
        for (let i = 0; i < polygon.length; i++) {
            polygon[i] = new Vec2(polygon[i][0], polygon[i][1]);
        }

        if (!MathHelper.isCCW(polygon)) {
            console.error('Found CW polygon.');
            return;
        }

        let minX = polygon[0].x;
        let minY = polygon[0].y;
        let maxX = polygon[0].x;
        let maxY = polygon[0].y;
        for (let i = 0; i < polygon.length; i++) {
            minX = Math.min(minX, polygon[i].x);
            minY = Math.min(minY, polygon[i].y);
            maxX = Math.max(maxX, polygon[i].x);
            maxY = Math.max(maxY, polygon[i].y);
        }

        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = minX;
        aabb.lowerBound.y = minY;
        aabb.upperBound.x = maxX;
        aabb.upperBound.y = maxY;

        PhysicsManager.dynamicTree.CreateProxy(aabb, polygon);
    }
}