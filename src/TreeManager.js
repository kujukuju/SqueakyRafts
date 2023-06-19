class TreeManager {
    static nextTreeID = 0;

    static trees = [];
    static dynamicTree = new box2d.b2DynamicTree();

    static getTree(id) {
        if (TreeManager.trees[id].id === id) {
            return TreeManager.trees[id];
        }

        for (let i = 0; i < TreeManager.trees.length; i++) {
            if (TreeManager.trees[i].id === id) {
                return TreeManager.trees[i];
            }
        }

        return null;
    }

    static addTree(point) {
        const tree = new ChoppableTree(TreeManager.nextTreeID++, new Vec2(point[0], point[1]));
        TreeManager.trees.push(tree);

        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = point.x;
        aabb.lowerBound.y = point.y;
        aabb.upperBound.x = point.x;
        aabb.upperBound.y = point.y;
        TreeManager.dynamicTree.CreateProxy(aabb, tree);

        PhysicsManager.addPolygon(getPolygonAroundPoint(point, 15, 10, 8));
    }

    static addTreeList(pointList) {
        for (let i = 0; i < pointList.length; i++) {
            this.addTree(pointList[i]);
        }
    }

    static getNearbyTree(point) {
        const allowedDistanceSquared = 20 * 20;

        const testAABB = new box2d.b2AABB();
        testAABB.lowerBound.x = point.x - 20;
        testAABB.lowerBound.y = point.y - 20;
        testAABB.upperBound.x = point.x + 20;
        testAABB.upperBound.y = point.y + 20;

        let found = null;
        TreeManager.dynamicTree.Query(node => {
            const position = node.userData.position;
            if (position.distanceSquared(point) <= allowedDistanceSquared) {
                found = node.userData;
                return false;
            }
            return true;
        }, testAABB);

        return found;

        for (let i = 0; i < TreeManager.trees.length; i++) {
            const position = TreeManager.trees[i].position;
            if (position.distanceSquared(point) <= allowedDistanceSquared) {
                return TreeManager.trees[i];
            }
        }

        return null;
    }
}