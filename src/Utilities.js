const linkAll = (sprite, names) => {
    for (let i = 0; i < names.length; i++) {
        for (let a = 0; a < names.length; a++) {
            if (i === a) {
                continue;
            }

            sprite.linkAnimations(names[i], names[a]);
        }
    }
};

const cullSprite = (sprite) => {
    const minX = sprite.position.x - sprite.width * sprite.anchor.x;
    const minY = sprite.position.y - sprite.height * sprite.anchor.y;
    const maxX = sprite.position.x + sprite.width * (1 - sprite.anchor.x);
    const maxY = sprite.position.y + sprite.height * (1 - sprite.anchor.y);

    let overlap = true;
    overlap = overlap && maxX > Camera.aabb.x;
    overlap = overlap && maxY > Camera.aabb.y;
    overlap = overlap && minX <= Camera.aabb.x + Camera.aabb.width;
    overlap = overlap && minY <= Camera.aabb.y + Camera.aabb.height;

    sprite.visible = overlap;
};

const getPolygonAroundPoint = (point, halfWidth, halfHeight, vertices) => {
    const polygon = [];

    for (let i = 0; i < vertices; i++) {
        const progress = i / vertices;

        const angle = -Math.PI * 2 * progress;
        const x = point[0] + Math.cos(angle) * halfWidth;
        const y = point[1] + Math.sin(angle) * halfHeight;
        polygon.push([x, y]);
    }
    
    return polygon;
};

const isAudioFinished = (instance) => {
    if (!instance || !instance._source) {
        return true;
    }

    if (instance.getLoop()) {
        return false;
    }

    const duration = instance._source.getDuration();
    const time = instance.getCurrentTime();

    return time > duration;
};