/*
 Copyright 2021 - 2023 The Matrix.org Foundation C.I.C.
 Copyright 2023 metamuffin <metamuffin.org>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import ICanvasEffect from "../ICanvasEffect";
import { arrayFastClone } from "../../utils/arrays";

export type RocketsOptions = {
    maxCount: number;
};

type Rocket = {
    x: number;
    y: number;
    speed: number,
    thrust: number;
};

export const DefaultOptions: RocketsOptions = {
    maxCount: 50,
};

const KEY_FRAME_INTERVAL = 15; // 15ms, roughly
const ANG_F = 0.4;


export default class SpaceInvaders implements ICanvasEffect {
    private readonly options: RocketsOptions;

    public constructor(options: { [key: string]: any }) {
        this.options = { ...DefaultOptions, ...options };
    }

    private context: CanvasRenderingContext2D | null = null;
    private particles: Array<Rocket> = [];
    private lastAnimationTime = 0;

    public isRunning = false;

    public start = async (canvas: HTMLCanvasElement, timeout = 3000): Promise<void> => {
        if (!canvas) {
            return;
        }
        this.context = canvas.getContext("2d");
        this.particles = [];
        const count = this.options.maxCount;
        while (this.particles.length < count) {
            this.particles.push(this.resetParticle({} as Rocket, canvas.width, canvas.height));
        }
        this.isRunning = true;
        requestAnimationFrame(this.renderLoop);
        if (timeout) {
            window.setTimeout(this.stop, timeout);
        }
    };

    public stop = async (): Promise<void> => {
        this.isRunning = false;
    };

    private resetParticle = (particle: Rocket, width: number, height: number): Rocket => {
        particle.x = Math.random() * width - width * ANG_F;
        particle.y = Math.random() * height + height;
        particle.speed = Math.random() * 2 + 1;
        particle.thrust = Math.random() * 0.3 + 0.2;
        return particle;
    };

    private renderLoop = (): void => {
        if (!this.context || !this.context.canvas) {
            return;
        }
        if (this.particles.length === 0) {
            this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        } else {
            const timeDelta = Date.now() - this.lastAnimationTime;
            if (timeDelta >= KEY_FRAME_INTERVAL || !this.lastAnimationTime) {
                // Clear the screen first
                this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

                this.lastAnimationTime = Date.now();
                this.animateAndRenderInvaders();
            }
            requestAnimationFrame(this.renderLoop);
        }
    };

    private animateAndRenderInvaders(): void {
        if (!this.context || !this.context.canvas) {
            return;
        }
        this.context.font = "50px Twemoji";
        for (const particle of arrayFastClone(this.particles)) {
            particle.speed += particle.thrust;
            particle.y += -1 * particle.speed;
            particle.x += ANG_F * particle.speed;
            this.context.save();
            this.context.fillText("🚀", particle.x, particle.y);
            this.context.restore();
        }
    }
}
