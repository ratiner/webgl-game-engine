import { GameContext, GameLayer } from 'src/game-engine';
import { WelcomeScene } from './scenes/welcome.scene';
import { Test2Scene } from './scenes/test2.scene';

export class DemoGame extends GameContext {
    currentScene: GameLayer;
    welcomeScene: WelcomeScene;
    test2Scene: Test2Scene;

    constructor() {
        super();

        const hostElement = document.getElementById('host');
        this.attach(hostElement);
        // Bind to events
        window.onresize = () => this.resize();

        window.onmousewheel = (ev: WheelEvent) => {
            if (ev.deltaY < 0) {
                if (!(this.currentScene instanceof Test2Scene)) {
                    this.currentScene = this.test2Scene;
                }
            } else if (ev.deltaY > 0) {
                if (!(this.currentScene instanceof Test2Scene)) {
                    this.currentScene = this.test2Scene;
                }
            }
        };
    }

    setup() {
        this.welcomeScene = new WelcomeScene(this);
        this.test2Scene = new Test2Scene(this);
        this.currentScene = this.welcomeScene;
    }

    draw() {
        this.currentScene.draw();
    }
}
