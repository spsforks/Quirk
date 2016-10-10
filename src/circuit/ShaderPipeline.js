import {DetailedError} from "src/base/DetailedError.js"
import {Shaders} from "src/webgl/Shaders.js"
import {WglArg} from "src/webgl/WglArg.js"
import {WglShader} from "src/webgl/WglShader.js"
import {WglConfiguredShader} from "src/webgl/WglConfiguredShader.js"
import {WglTexture} from "src/webgl/WglTexture.js"
import {workingShaderCoder} from "src/webgl/ShaderCoders.js"

/**
 * Stores a sequence of transformations to apply to textures, with output sizes known ahead of time.
 */
class ShaderPipeline {
    constructor() {
        /**
         * @type {!Array.<!{w: !int, h: !int, shaderFunc: !function(!WglTexture, keepResult: !boolean): !WglConfiguredShader>}
         */
        this.steps = [];
    }

    /**
     * @param {!int} outWidth
     * @param {!int} outHeight
     * @param {!function(!WglTexture): !WglConfiguredShader} nearlyConfiguredShader
     * @param {!boolean=} keepResult
     */
    addSizedStep(outWidth, outHeight, nearlyConfiguredShader, keepResult=false) {
        this.steps.push({
            w: outWidth,
            h: outHeight,
            shaderFunc: nearlyConfiguredShader,
            keepResult});
    }

    /**
     * @param {!int} qubitCount
     * @param {!function(!WglTexture): !WglConfiguredShader} nearlyConfiguredShader
     * @param {!boolean=} keepResult
     */
    addPowerSizedStep(qubitCount, nearlyConfiguredShader, keepResult=false) {
        let {w, h} = WglTexture.preferredSizeForOrder(qubitCount);
        this.addSizedStep(w, h, nearlyConfiguredShader, keepResult);
    }

    /**
     * @param {!int} qubitCount
     * @param {!function(!WglTexture): !WglConfiguredShader} nearlyConfiguredShader
     * @param {!boolean=} keepResult
     */
    addPowerSizedStepVec2(qubitCount, nearlyConfiguredShader, keepResult=false) {
        this.addPowerSizedStep(qubitCount + workingShaderCoder.vec2Overhead, nearlyConfiguredShader, keepResult);
    }

    /**
     * @param {!int} qubitCount
     * @param {!function(!WglTexture): !WglConfiguredShader} nearlyConfiguredShader
     * @param {!boolean=} keepResult
     */
    addPowerSizedStepVec4(qubitCount, nearlyConfiguredShader, keepResult=false) {
        this.addPowerSizedStep(qubitCount + workingShaderCoder.vec4Overhead, nearlyConfiguredShader, keepResult);
    }

    /**
     * @param {!ShaderPipeline} other
     * @param {!boolean=} keepResult
     */
    addPipelineSteps(other, keepResult=false) {
        for (let i = 0; i < other.steps.length; i++) {
            let {w, h, shaderFunc} = other.steps[i];
            this.addSizedStep(w, h, shaderFunc, i === other.steps.length-1 && keepResult);
        }
    }
}

export {ShaderPipeline}
