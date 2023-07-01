class Loop {
    static time = 0;
    static TICK = 16;

    static lastTime = 0;

    static loop() {
        Loop.time = Date.now();
        
        while (Loop.time - Loop.lastTime < Loop.TICK) {
            Loop.time = Date.now();
        }

        Logic.update();
        Renderer.render();

        const finish = Date.now();
        const duration = finish - Loop.time;

        Loop.lastTime = Loop.time;

        // is this okay to do or is the extra () => {} gonna stack overflow or something
        window.requestAnimationFrame(Loop.loop);
        // setTimeout(() => {
        //     Loop.loop();
        // }, Math.max(1, Loop.TICK - duration));
    }
}