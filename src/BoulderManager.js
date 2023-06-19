class BoulderManager {
    static nextBoulderID = 0;

    static boulders = [];
    static dynamicTree = new box2d.b2DynamicTree();

    static getBoulder(id) {
        if (BoulderManager.boulders[id].id === id) {
            return BoulderManager.boulders[id];
        }

        for (let i = 0; i < BoulderManager.boulders.length; i++) {
            if (BoulderManager.boulders[i].id === id) {
                return BoulderManager.boulders[i];
            }
        }

        return null;
    }

    static addBoulder(point, underwater) {
        const boulder = new BreakableBoulder(BoulderManager.nextBoulderID++, new Vec2(point[0], point[1]), underwater);
        BoulderManager.boulders.push(boulder);

        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = point.x;
        aabb.lowerBound.y = point.y;
        aabb.upperBound.x = point.x;
        aabb.upperBound.y = point.y;
        BoulderManager.dynamicTree.CreateProxy(aabb, boulder);

        if (!underwater) {
            PhysicsManager.addPolygon(getPolygonAroundPoint(point, 30, 10, 8));
        }
    }

    static addBoulderList(pointList, underwater) {
        for (let i = 0; i < pointList.length; i++) {
            this.addBoulder(pointList[i], underwater);
        }
    }

    static getNearbyBoulder(point) {
        const allowedDistanceSquared = 20 * 20;

        const testAABB = new box2d.b2AABB();
        testAABB.lowerBound.x = point.x - 20;
        testAABB.lowerBound.y = point.y - 20;
        testAABB.upperBound.x = point.x + 20;
        testAABB.upperBound.y = point.y + 20;

        let found = null;
        BoulderManager.dynamicTree.Query(node => {
            const position = node.userData.position;
            if (position.distanceSquared(point) <= allowedDistanceSquared) {
                found = node.userData;
                return false;
            }
            return true;
        }, testAABB);

        return found;

        // for (let i = 0; i < BoulderManager.boulders.length; i++) {
        //     const position = BoulderManager.boulders[i].position;
        //     if (position.distanceSquared(point) <= allowedDistanceSquared) {
        //         return BoulderManager.boulders[i];
        //     }
        // }

        // return null;
    }
}