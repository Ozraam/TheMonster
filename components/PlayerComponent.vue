<script setup>
import { storeToRefs } from 'pinia';
import { useAnimationStore } from '~/stores/Animation';
import { useGameStore } from '~/stores/Game';

const game = useGameStore();


const background = ref(null);
const player = ref(null);
const time = ref(500);
const animationStore = useAnimationStore();
let animationPlayerMove = null;
const foodRain = ref(null);
const ordinateur = ref("null");
const bureau = ref("null");

const positionX = ref(50);

function playerMoveArroundRandom() {
    if (animationStore.isAnimating) return;

    const x = Math.floor(Math.random() * 50) - 25;
    let newPositionX = positionX.value + x;

    const run = Math.floor(Math.random() * 2);

    const randomTime = Math.floor(Math.random() * 1000) + 500;

    movePlayerTo(newPositionX, run, () => {
        setTimeout(playerMoveArroundRandom, randomTime);
    });

}

function movePlayerTo(newPosition, run = false, callback = null, speed = 1) {

    const playerHtml = player.value.$el;
    const x = newPosition - positionX.value;


    if (newPosition > 99) {
        newPosition = 99;
    } else if (newPosition < 2) {
        newPosition = 2;
    }

    if (x > 0) {
        player.value.flip(false)
    } else {
        player.value.flip(true)
    }

    player.value.changeAnim(run ? "run" : "walk");

    if (x > 0) {
        player.value.flip(false)
    } else {
        player.value.flip(true)
    }


    const screenRatioSpeed = window.innerHeight / window.innerWidth + 0.5;


    speed *= screenRatioSpeed;



    time.value = Math.abs(x * 300);
    time.value = run ? time.value / 3 : time.value;
    time.value = time.value / speed;


    animationPlayerMove = playerHtml.animate([
        { left: `${newPosition}%`, offset: 1 }
    ], {
        duration: time.value,
        fill: "forwards",
    })

    const calculInfoInterval = setInterval(() => {
        player.value?.calculateInfoOffset();
    }, 1)

    setTimeout(() => {
        clearInterval(calculInfoInterval);
    }, time.value)

    animationPlayerMove.onfinish = () => {
        positionX.value = newPosition;
        if (!animationStore.isAnimating) player.value.changeAnim("idle");
        if (callback) callback();
    }
}



function stopPlayerMovement() {
    if (animationPlayerMove) {
        animationPlayerMove.pause();
    }
}


function playerFight() {
    player.value.flip(false);
    player.value.changeAnim("fight");
    setTimeout(() => {
        player.value.changeAnim("idle");
        useAnimationStore().setAnimation(null);
    }, 3000)
}

function passwork() {
    const animateTime = 5000;
    ordinateur.value.classList.add("active");

    useAnimationStore().setAnimation(useAnimations().animations.work);
    document.querySelector(".ordi.active").animate([
        { 'left': '110%' },
        { 'left': '87.5%' },
        { 'left': '87.5%' },
        { 'left': '110%' }
    ], {
        duration: animateTime,
        easing: 'ease-in-out',
    })

    bureau.value.classList.add("active");
    document.querySelector(".bureau.active").animate([
        { 'left': '110%' },
        { 'left': '87.5%' },
        { 'left': '87.5%' },
        { 'left': '110%' }
    ], {
        duration: animateTime,
        easing: 'ease-in-out'
    })
    setTimeout(() => {
        ordinateur.value.classList.remove("active");
        bureau.value.classList.remove("active");
        useAnimationStore().setAnimation(null);
    }, animateTime);
}



onMounted(() => {
    setTimeout(playerMoveArroundRandom, 1000);
    // movePlayerTo(99, true, ()=>{movePlayerTo(0, true)}, 2)
})

const { animation } = storeToRefs(animationStore);

watch(animation, (value) => {
    if (value === useAnimations().animations.sleep) {
        stopPlayerMovement();

        movePlayerTo(37.5, true, () => {
            background.value.passNight();
            player.value.changeAnim("sleep");
        }, 1.5)


    } else if (value === useAnimations().animations.work) {
        player.value.positionX = 50;
        stopPlayerMovement();
        movePlayerTo(87.5, true, () => {
            passwork();
            player.value.changeAnim("work");
        }, 1.5)
    } else if (value === useAnimations().animations.fight) {
        stopPlayerMovement();
        movePlayerTo(12.5, true, () => {
            playerFight();
        }, 1.5)
    } else if (value === useAnimations().animations.food) {
        stopPlayerMovement();
        movePlayerTo(62.5, true, () => {
            foodRain.value.startRain();
            player.value.changeAnim("jump")
        }, 1.5)

    } else if (value == useAnimations().animations.levelUp) {
        stopPlayerMovement();
        background.value.levelUp();
    }
    else {
        if (useAnimationStore().options.callback) useAnimationStore().options.callback();
        playerMoveArroundRandom();
    }
})

const { gameOver } = storeToRefs(useGameStore())

watch(gameOver, (value) => {
    if (gameOver) {
        player.value.changeAnim(value === useEndGameStates().endGameStates.win ? useAnimations().playerAnimations.jump : useAnimations().playerAnimations.death)
        stopPlayerMovement();
        setTimeout(() => {
            navigateTo("/game-" + value)
        }, 1500)
    }
});
</script>

<template>
    <main class="position-relative playground">

        <Background ref="background" />
        <img src="~/assets/img/ordi.png" class="ordi position-absolute active" alt="ordi" ref="ordinateur">
        <img src="~/assets/img/bureau.png" class="bureau position-absolute active" alt="bureau" ref="bureau">

        <PlayerAnimation ref="player" class="position-absolute player" />
        <div class="infoHistory">
            <div class="info">
                <ObjectifComponent />
                <InfoLevel class="level" />
            </div>
            <div class="history">
                <History />
            </div>
        </div>
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-body">
                        <MonsterComponent v-if="game.currentAction === useActions().actions.fight" class="activated" />
                        <EatingChoice v-else-if="game.currentAction === useActions().actions.eat" class="activated" />
                    </div>
                </div>
            </div>
        </div>
        <div class="action">
            <ActionComponent class="action" />
        </div>
        <FoodRain ref="foodRain" />
    </main>
</template>

<style scoped>
.player {
    bottom: 15.5%;
    left: 50%;
    transform: translate(-50%, -50%);
}


.playground {
    overflow: hidden;
}

.ordi {
    left: 110%;
    transform: translateX(-50%);
    bottom: 17.3%;
    width: 2%;
    transition: all 5s ease-in-out;
}


.bureau {
    left: 110%;
    transform: translateX(-50%);
    bottom: 16%;
    width: 4%;
    transition: all 5s ease-in-out;
}


.info {
    width: 400px;
    position: absolute;
    top: 3%;
    left: 1%;
}


.history {
    width: 400px;
    position: absolute;
    top: 3%;
    right: 1%;
}

@media (max-width: 850px) {
    .info {
        width: 100%;
        top: 0;
        left: 0;
        position: relative;
    }

    .history {
        width: 100%;
        right: 0;
        top: 0;
        position: relative;
    }

    .level {
        margin-top: 0px;
    }
}

.action {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
}

/*create animation*/
@keyframes up {
    0% {
        opacity: 0;
        transform: translateY(100%);

    }

    50% {
        opacity: 0.1;
    }

    75% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
        transform: translateY(0%);
    }
}

/*used animation for class activated*/
.activated {
    z-index: 10;
    animation: up 0.5s ease-in-out;
}

main {
    height: 100vh;
    width: 100%;
}
</style>