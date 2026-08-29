class Loop {
    static time = 0;
    static TICK = 16;

    static lastFrameTime = null;

    static loop(frameTime = performance.now()) {
        window.requestAnimationFrame(Loop.loop);

        if (Loop.lastFrameTime === null) {
            Loop.lastFrameTime = frameTime - Loop.TICK;
        }

        const elapsed = frameTime - Loop.lastFrameTime;
        if (elapsed < Loop.TICK) {
            return;
        }
        Loop.lastFrameTime = frameTime - elapsed % Loop.TICK;
        Loop.time = Date.now();

        Logic.update();
        Renderer.render();
    }
}