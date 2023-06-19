class MathHelper {
    static hermite(p1, p2, v1, v2, t, mul) {
        const n1 = 2 * t * t * t - 3 * t * t + 1;
        const n2 = t * t * t - 2 * t * t + t;
        const n3 = -2 * t * t * t + 3 * t * t;
        const n4 = t * t * t - t * t;

        return new Vec2(
            n1 * p1.x + n2 * v1.x * mul + n3 * p2.x + n4 * v2.x * mul,
            n1 * p1.y + n2 * v1.y * mul + n3 * p2.y + n4 * v2.y * mul);
    }

    // concave
    static isCCW(polygon) {
        if (polygon.length < 3) {
            return true;
        }
    
        let area = 0;
        for (let i = 0; i < polygon.length; i++) {
            // get the current point and the next point
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];
            // add the signed area
            area += p1.cross(p2);
        }
        // return the area
        return area < 0;
    }

    static isConvex(polygon) {
        if (polygon.length <= 3) {
            return true;
        }
    
        if (polygon.length === 4) {
            return MathHelper.isConvexQuad(polygon[0], polygon[1], polygon[2], polygon[3]);
        }
    
        for (let i = 0; i < polygon.length; i++) {
            const i2 = (i + 1) % polygon.length;
            const i3 = (i + 2) % polygon.length;
            const i4 = (i + 3) % polygon.length;
            if (!MathHelper.isConvexQuad(polygon[i], polygon[i2], polygon[i3], polygon[i4])) {
                return false;
            }
        }
    
        return true;
    }

    static isConvexQuad(a, b, c, d) {
        const bda = Vec2.copy(d).sub(b).cross(Vec2.copy(a).sub(b));
        const bdc = Vec2.copy(d).sub(b).cross(Vec2.copy(c).sub(b));
        if (bda * bdc > 0) {
            return false;
        }

        const acd = Vec2.copy(c).sub(a).cross(Vec2.copy(d).sub(a));
        const acb = Vec2.copy(c).sub(a).cross(Vec2.copy(b).sub(a));

        return acd * acb <= 0;
    }

    // concave
    static isPointInPolygon(polygon, point) {
        let j = polygon.length - 1;
        let oddNodes = false;
    
        for (let i = 0; i < polygon.length; i++) {
            let cond = polygon[i].y < point.y && polygon[j].y >= point.y || polygon[j].y < point.y && polygon[i].y >= point.y;
            cond = cond && (polygon[i].x <= point.x || polygon[j].x <= point.x);
            if (cond) {
                if (polygon[i].x + (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) * (polygon[j].x - polygon[i].x) < point.x) {
                    oddNodes = !oddNodes;
                }
            }
    
            j = i;
        }
    
        return oddNodes;
    }

    static getNearestNormal(polygon, point) {
        let min = Number.MAX_SAFE_INTEGER;
        let minIndex = -1;

        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];

            const line = [p1, p2];
            const distance = MathHelper.distanceToLineSegment(line, point);
            if (distance < min) {
                min = distance;
                minIndex = i;
            }
        }

        if (minIndex >= 0) {
            const p1 = polygon[minIndex];
            const p2 = polygon[(minIndex + 1) % polygon.length];

            return Vec2.copy(p2).sub(p1).orthogonal();
        }

        return null;
    }

    static nearestPointOnLineSegment(line, point) {
        const lineDX = line[1].x - line[0].x;
        const lineDY = line[1].y - line[0].y;
        const length2 = lineDX * lineDX + lineDY * lineDY;
        if (length2 === 0) {
            return new Vec2(line[0].x, line[0].y);
        }

        const t = ((point.x - line[0].x) * (line[1].x - line[0].x) + (point.y - line[0].y) * (line[1].y - line[0].y)) / length2;
        if (t < 0) {
            return new Vec2(line[0].x, line[0].y);
        }
        if (t > 1) {
            return new Vec2(line[1].x, line[1].y);
        }

        return new Vec2(line[0].x + t * (line[1].x - line[0].x), line[0].y + t * (line[1].y - line[0].y));
    }

    static distanceToLineSegment(line, point) {
        const nearestPoint = MathHelper.nearestPointOnLineSegment(line, point);

        const dx = nearestPoint.x - point.x;
        const dy = nearestPoint.y - point.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    static nearestPointOnPolygonEdge(polygon, point) {
        let minDist = Number.MAX_SAFE_INTEGER;
        let minPoint = null;
        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];

            const nearestPoint = this.nearestPointOnLineSegment([p1, p2], point);
            const nearestDistSquared = nearestPoint.distanceSquared(point);
            if (nearestDistSquared < minDist) {
                minDist = nearestDistSquared;
                minPoint = nearestPoint;
            }
        }

        return minPoint;
    }

    static distanceToPolygonEdge(polygon, point) {
        let min = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];

            const line = [p1, p2];
            const distance = MathHelper.distanceToLineSegment(line, point);
            min = Math.min(min, distance);
        }

        return min;
    }

    static radiansBetween(start, end) {
        if (end < start) {
            if (start - end > Math.PI) {
                return Math.PI * 2 - (start - end);
            } else {
                return -(start - end);
            }
        } else {
            if (end - start > Math.PI) {
                return -(Math.PI * 2 - (end - start));
            } else {
                return end - start;
            }
        }
    }

    static easeInOut(t) {
        const p = 2.0 * t * t;
        return t < 0.5 ? p : (-p + (4.0 * t) - 1.0);
    }

    // static cross(a, b) {
    //     return a.x * b.y - a.y * b.x
    // }

    // static dot(a, b) {
    //     return a.x * b.x + a.y * b.y
    // }
}