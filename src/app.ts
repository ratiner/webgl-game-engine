import { GameEngine } from './game-engine';

window.onload = () => {
    const hostElement = document.getElementById('host');
    const gameEngine = new GameEngine(hostElement);
    window.onresize = () => gameEngine.resize();
};
