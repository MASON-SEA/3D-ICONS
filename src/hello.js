/*
 * @Date: 2024-07-02 21:20:54
 * @LastEditors: mason
 * @LastEditTime: 2024-07-02 22:24:42
 * @FilePath: \3D=ICONS\src\hello.js
 */
import { LitElement, css, html } from 'lit'
import * as THREE from 'three';
import { color, fog, float, positionWorld, triNoise3D, positionView, normalWorld, uniform, MeshPhongNodeMaterial } from 'three/examples/jsm/nodes/Nodes.js';
import WebGPU from 'three/examples/jsm/capabilities/WebGPU.js';
import WebGL from 'three/examples/jsm/capabilities/WebGL.js';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class MyElement extends LitElement {
    static get properties() {
        return {
            /**
             * Copy for the read the docs hint.
             */
            docsHint: { type: String },

            /**
             * The number of times the button has been clicked.
             */
            count: { type: Number },
        }
    }

    constructor() {
        super()
        this.docsHint = 'Click on the Vite and Lit logos to learn more'
        this.count = 0
    }

    render() {
        return html`
    `
    }

    _onClick() {
        this.count++
    }

    firstUpdated() {
        console.log(this.shadowRoot);
        console.log(this);
    }

    draw() {

        let camera, scene, renderer;
        let controls;

        init();

        function init() {

            if (WebGPU.isAvailable() === false && WebGL.isWebGL2Available() === false) {

                document.body.appendChild(WebGPU.getErrorMessage());

                throw new Error('No WebGPU or WebGL2 support');

            }

            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 600);
            camera.position.set(30, 15, 30);

            scene = new THREE.Scene();

            // custom fog

            const skyColor = color(0xf0f5f5);
            const groundColor = color(0xd0dee7);

            const fogNoiseDistance = positionView.z.negate().smoothstep(0, camera.far - 300);

            const distance = fogNoiseDistance.mul(20).max(4);
            const alpha = .98;
            const groundFogArea = float(distance).sub(positionWorld.y).div(distance).pow(3).saturate().mul(alpha);

            // a alternative way to create a TimerNode
            const timer = uniform(0).onFrameUpdate((frame) => frame.time);

            const fogNoiseA = triNoise3D(positionWorld.mul(.005), 0.2, timer);
            const fogNoiseB = triNoise3D(positionWorld.mul(.01), 0.2, timer.mul(1.2));

            const fogNoise = fogNoiseA.add(fogNoiseB).mul(groundColor);

            // apply custom fog

            scene.fogNode = fog(fogNoiseDistance.oneMinus().mix(groundColor, fogNoise), groundFogArea);
            scene.backgroundNode = normalWorld.y.max(0).mix(groundColor, skyColor);

            // builds

            const buildWindows = positionWorld.y.mul(10).floor().mod(4).sign().mix(color(0x000066).add(fogNoiseDistance), color(0xffffff));

            const buildGeometry = new THREE.BoxGeometry(1, 1, 1);
            const buildMaterial = new MeshPhongNodeMaterial({
                colorNode: buildWindows
            });

            const buildMesh = new THREE.InstancedMesh(buildGeometry, buildMaterial, 4000);
            scene.add(buildMesh);

            const dummy = new THREE.Object3D();
            const center = new THREE.Vector3();

            for (let i = 0; i < buildMesh.count; i++) {

                const scaleY = Math.random() * 7 + .5;

                dummy.position.x = Math.random() * 600 - 300;
                dummy.position.z = Math.random() * 600 - 300;

                const distance = Math.max(dummy.position.distanceTo(center) * .012, 1);

                dummy.position.y = .5 * scaleY * distance;

                dummy.scale.x = dummy.scale.z = Math.random() * 3 + .5;
                dummy.scale.y = scaleY * distance;

                dummy.updateMatrix();

                buildMesh.setMatrixAt(i, dummy.matrix);

            }

            // lights

            scene.add(new THREE.HemisphereLight(skyColor.value, groundColor.value, 0.5));

            // geometry

            const planeGeometry = new THREE.PlaneGeometry(200, 200);
            const planeMaterial = new THREE.MeshPhongMaterial({
                color: 0x999999
            });

            const ground = new THREE.Mesh(planeGeometry, planeMaterial);
            ground.rotation.x = - Math.PI / 2;
            ground.scale.multiplyScalar(3);
            ground.castShadow = true;
            ground.receiveShadow = true;
            scene.add(ground);

            // renderer

            renderer = new WebGPURenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setAnimationLoop(animate);
            document.body.appendChild(renderer.domElement);

            // controls

            controls = new OrbitControls(camera, renderer.domElement);
            controls.target.set(0, 2, 0);
            controls.minDistance = 7;
            controls.maxDistance = 100;
            controls.maxPolarAngle = Math.PI / 2;
            controls.autoRotate = true;
            controls.autoRotateSpeed = .1;
            controls.update();

            window.addEventListener('resize', resize);

        }

        function resize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

        }

        function animate() {

            controls.update();

            renderer.render(scene, camera);

        }
    }

    static get styles() {
        return css`
      :host{
        width: 100%;
        height: 100%;
      }
    `
    }
}

window.customElements.define('ys-icons-hello', MyElement)