import { defineStore } from "pinia";
import { useMonsterStore } from "./Monster";
import { useAnimationStore } from "./Animation";

function isLevelCompleted(level) {
    return level.objectives.list.every((objective) => objective.progress >= objective.value);
}

export const useGameStore = defineStore({
    id: "game",
    state: () => ({
        numTurns: 0,
        history: [],
        malus: null,
        difficulty: 0,
        objectivesIndex: 0,
        levels : useLevels().levels,
        currentAction: null,
        gameOver: useEndGameStates().endGameStates.none,
    }),
    getters: {
        getNumberOfDaysLastTimeSleep() {
            const lastTimeSleep = this.history.findLast((history) => history.action === useActions().actions.sleep);
            if (!lastTimeSleep) {
                return this.numTurns;
            }
            return this.numTurns - lastTimeSleep.turn;
        },
        lastAction() {
            return this.history[this.history.length - 1]?.action;
        },
        getObjectivesLevel() {
            return this.objectives;
        },
        getMalusLevel() {
            return this.levels[this.objectivesIndex % this.levels.length].malus;
        },
        objectives() {
            return this.levels[this.objectivesIndex % this.levels.length].objectives;
        },
        levelsCompleted() {
            return this.levels.filter((level) => isLevelCompleted(level));
        },
        levelsNotCompleted() {
            return this.levels.filter((level) => !isLevelCompleted(level));
        },
    },
    actions: {
        incrementLevel() {
            this.objectivesIndex++;

            this.numTurns = 0;
            this.history = [];
            console.log(this.objectivesIndex);
            if(this.objectivesIndex >= this.levels.length) {
                console.log("You win");
                this.gameOver = useEndGameStates().endGameStates.win;
                return;
            }
            useAnimationStore().setAnimation(useAnimations().animations.levelUp, {});
            
            this.setMalus(useLevels().levels[this.objectivesIndex].malus);
        },
        checkLevelUp(){
            if(isLevelCompleted(this.levels[this.objectivesIndex])) {
                this.incrementLevel();
            }
        },
        incrementNumTurns() {
            this.numTurns++;
            this.currentAction = null;
            useMonsterStore().newTurn();
            this.checkLevelUp();
        },
        addHistory(action, detail=null) {
            this.history.push({action: action, turn: this.numTurns, detail: detail});
        },
        setMalus(malus) {
            this.malus = malus;
        },
        setDifficulty(difficulty) {
            this.difficulty = difficulty;
        },
        incrementObjectiveProgress(value, type) {
            if(!this.objectives.list.some((o) => o.type === type)) return false;
            
            const o = this.objectives.list.find((o) => o.type === type)
            o.progress += value;
        },
        setGameOver(value) {
            this.gameOver = value;
        }
    }
});
