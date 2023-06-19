class IslandManager {
    static polygons = [];
    static aabbs = [];
    static expandedAABBs = [];
    static veryExpandedAABBs = [];

    static nearPadding = 57;
    static farPadding = 1000;

    static spawnIsland = -1;

    static getSpawnPoint() {
        if (IslandManager.spawnIsland < 0 || IslandManager.spawnIsland >= IslandManager.polygons.length) {
            return null;
        }

        const aabb = IslandManager.aabbs[IslandManager.spawnIsland];
        const polygon = IslandManager.polygons[IslandManager.spawnIsland];
        for (let i = 0; i < 10; i++) {
            const randomX = aabb.x + aabb.width * Math.random();
            const randomY = aabb.y + aabb.height * Math.random();
            const point = new Vec2(randomX, randomY);

            if (MathHelper.isPointInPolygon(polygon, point)) {
                return point;
            }
        }

        return null;
    }

    static addIsland(polygon) {
        for (let i = 0; i < polygon.length; i++) {
            polygon[i] = new Vec2(polygon[i][0], polygon[i][1]);
        }

        let maxX = polygon[0].x;
        let maxY = polygon[0].y;
        const aabb = new AABB(polygon[0].x, polygon[0].y, 0, 0);
        for (let i = 0; i < polygon.length; i++) {
            aabb.x = Math.min(aabb.x, polygon[i].x);
            aabb.y = Math.min(aabb.y, polygon[i].y);
            maxX = Math.max(maxX, polygon[i].x);
            maxY = Math.max(maxY, polygon[i].y);
        }

        aabb.width = maxX - aabb.x;
        aabb.height = maxY - aabb.y;

        const padding = IslandManager.nearPadding;
        const farPadding = IslandManager.farPadding;
        const expanded = new AABB(aabb.x - padding, aabb.y - padding, aabb.width + padding * 2, aabb.height + padding * 2);
        const veryExpanded = new AABB(aabb.x - farPadding, aabb.y - farPadding, aabb.width + farPadding * 2, aabb.height + farPadding * 2);

        if (!MathHelper.isCCW(polygon)) {
            console.error('Found CW polygon.');
            return;
        }

        IslandManager.polygons.push(polygon);
        IslandManager.aabbs.push(aabb);
        IslandManager.expandedAABBs.push(expanded);
        IslandManager.veryExpandedAABBs.push(veryExpanded);
    }

    static isSwimming(point) {
        for (let i = 0; i < IslandManager.polygons.length; i++) {
            const aabb = IslandManager.aabbs[i];
            if (!aabb.contains(point.x, point.y)) {
                continue;
            }

            const polygon = IslandManager.polygons[i];
            if (MathHelper.isPointInPolygon(polygon, point)) {
                return false;
            }
        }

        return true;
    }

    static overlapsIsland(testAABB) {
        const potentialOverlaps = [];
        for (let i = 0; i < IslandManager.polygons.length; i++) {
            const aabb = IslandManager.aabbs[i];

            let overlaps = true;
            overlaps = overlaps && aabb.x <= testAABB.x + testAABB.width;
            overlaps = overlaps && aabb.y <= testAABB.y + testAABB.height;
            overlaps = overlaps && aabb.x + aabb.width >= testAABB.x;
            overlaps = overlaps && aabb.y + aabb.height >= testAABB.y;

            if (overlaps) {
                potentialOverlaps.push(IslandManager.polygons[i]);
            }
        }

        if (potentialOverlaps.length > 0) {
            return potentialOverlaps;
        }

        return null;
    }

    static isNearIsland(point) {
        for (let i = 0; i < IslandManager.polygons.length; i++) {
            const aabb = IslandManager.expandedAABBs[i];
            if (!aabb.contains(point.x, point.y)) {
                continue;
            }

            const polygon = IslandManager.polygons[i];
            const distance = MathHelper.distanceToPolygonEdge(polygon, point);
            if (distance <= IslandManager.nearPadding) {
                return true;
            }
        }

        return false;
    }

    static isNearIslandAtAll(point) {
        for (let i = 0; i < IslandManager.polygons.length; i++) {
            const aabb = IslandManager.veryExpandedAABBs[i];
            if (!aabb.contains(point.x, point.y)) {
                continue;
            }

            const polygon = IslandManager.polygons[i];
            const distance = MathHelper.distanceToPolygonEdge(polygon, point);
            if (distance <= IslandManager.farPadding) {
                return true;
            }
        }

        return false;
    }

    static getNearIslandAtAllStrength(point) {
        if (!IslandManager.isSwimming(point)) {
            return 1;
        }

        for (let i = 0; i < IslandManager.polygons.length; i++) {
            const aabb = IslandManager.veryExpandedAABBs[i];
            if (!aabb.contains(point.x, point.y)) {
                continue;
            }

            const polygon = IslandManager.polygons[i];
            const distance = MathHelper.distanceToPolygonEdge(polygon, point);
            if (distance <= IslandManager.farPadding) {
                return 1.0 - distance / IslandManager.farPadding;
            }
        }

        return 0;
    }

    static getClosestIslandFarRight(position) {
        // starter island
        if (IslandManager.expandedAABBs[0].contains(position.x, position.y)) {
            return 0;
        }

        for (let i = 0; i < IslandManager.polygons.length; i++) {
            const aabb = IslandManager.expandedAABBs[i];

            if (aabb.contains(position.x, position.y)) {
                return i;
            }
        }

        let minDistance = Number.MAX_SAFE_INTEGER;
        let minIsland = null;

        for (let i = 0; i < IslandManager.polygons.length; i++) {
            const aabb = IslandManager.aabbs[i];

            const deltaX = aabb.x - position.x;
            if (deltaX < 1500) {
                continue;
            }

            if (deltaX < minDistance) {
                minDistance = deltaX;
                minIsland = i;
            }
        }

        return minIsland;
    }
}