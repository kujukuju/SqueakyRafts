class Renderer {
    static application;

    static debug = new DebugCanvas();

    static fixed = new PIXI.Container();
    static map = new PIXI.Container();

    static container = new PIXI.Container();
    static underwater = new PIXI.Container();
    static abovewater = new PIXI.Container();

    static underwaterBackground = new PIXI.Container();
    static underwaterDecor = new PIXI.Container();
    static underwaterShark = new PIXI.Container();
    static underwaterRaft = new PIXI.Container();
    static underwaterForeground = new PIXI.Container();

    static abovewaterBackground = new PIXI.Container();
    static abovewaterRaft = new PIXI.Container();
    static abovewaterShadows = new PIXI.Container();
    static abovewaterForeground = new PIXI.Container();

    static initialize() {
        // can I not create this immediately?
        Renderer.application = new PIXI.Application({width: window.innerWidth, height: window.innerHeight, autoStart: false, antialias: true});
        document.getElementById('canvas-container').appendChild(Renderer.application.view);

        Renderer.application.stage.addChild(Renderer.container);
        Renderer.application.stage.addChild(Renderer.fixed);
        Renderer.application.stage.addChild(Renderer.map);

        Renderer.container.addChild(Renderer.underwater);
        Renderer.container.addChild(Renderer.abovewater);
        Renderer.container.addChild(Renderer.debug);

        Renderer.underwater.addChild(Renderer.underwaterBackground);
        Renderer.underwater.addChild(Renderer.underwaterDecor);
        Renderer.underwater.addChild(Renderer.underwaterShark);
        Renderer.underwater.addChild(Renderer.underwaterRaft);
        Renderer.underwater.addChild(Renderer.underwaterForeground);

        Renderer.abovewater.addChild(Renderer.abovewaterBackground);
        Renderer.abovewater.addChild(Renderer.abovewaterRaft);
        Renderer.abovewater.addChild(Renderer.abovewaterShadows);
        Renderer.abovewater.addChild(Renderer.abovewaterForeground);

        Renderer.underwaterForeground.sortableChildren = true;
        Renderer.abovewaterForeground.sortableChildren = true;
        Renderer.underwaterRaft.sortableChildren = true;
        Renderer.abovewaterRaft.sortableChildren = true;

        Camera.addContainer(Renderer.container);
        Camera.setScaleImmediate(new Vec2(3, 3));
        Camera.setScale(new Vec2(3, 3));
        Camera.setPositionImmediate(new Vec2(300, 300));
    }

    static render() {
        Renderer.application.render();
    }

    static resize() {
        Renderer.application.renderer.resize(window.innerWidth, window.innerHeight);
        Environment.resize();
        InstructionPage.resize();
        MapManager.resize();
        DeathScreen.resize();
        MainMenu.resize();
        WinManager.resize();
    }
}