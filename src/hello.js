/*
 * @Date: 2024-07-02 21:20:54
 * @LastEditors: MASON-SEA yangyangmason@outlook.com
 * @LastEditTime: 2024-07-03 11:26:06
 * @FilePath: \3D=ICONS\src\hello.js
 */
import { LitElement, css, html } from 'lit'
import * as THREE from 'three';

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
        this.draw();
    }

    draw() {
        let container = this.shadowRoot;

        let camera, scene, renderer;

        let windowHalfX = container.innerWidth / 2;
        let windowHalfY = container.innerHeight / 2;
        let shadowMesh;
        let { width, height } = this.getBoundingClientRect();

        init();

        function init() {

            camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
            camera.position.z = 1800;

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xffffff);

            const light = new THREE.DirectionalLight(0xffffff, 3);
            light.position.set(0, 0, 1);
            scene.add(light);

            // shadow

            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;

            const context = canvas.getContext('2d');
            const gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
            gradient.addColorStop(0.1, 'rgba(210,210,210,1)');
            gradient.addColorStop(1, 'rgba(255,255,255,1)');

            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);

            const shadowTexture = new THREE.CanvasTexture(canvas);

            const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture });
            const shadowGeo = new THREE.PlaneGeometry(300, 300, 1, 1);


            shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
            shadowMesh.position.y = - 250;
            shadowMesh.rotation.x = - Math.PI / 2;
            scene.add(shadowMesh);

            shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
            shadowMesh.position.y = - 250;
            shadowMesh.position.x = - 400;
            shadowMesh.rotation.x = - Math.PI / 2;
            scene.add(shadowMesh);

            shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
            shadowMesh.position.y = - 250;
            shadowMesh.position.x = 400;
            shadowMesh.rotation.x = - Math.PI / 2;
            scene.add(shadowMesh);

            const radius = 200;

            const geometry1 = new THREE.IcosahedronGeometry(radius, 1);

            const count = geometry1.attributes.position.count;
            geometry1.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));

            const geometry2 = geometry1.clone();
            const geometry3 = geometry1.clone();

            const color = new THREE.Color();
            const positions1 = geometry1.attributes.position;
            const positions2 = geometry2.attributes.position;
            const positions3 = geometry3.attributes.position;
            const colors1 = geometry1.attributes.color;
            const colors2 = geometry2.attributes.color;
            const colors3 = geometry3.attributes.color;

            for (let i = 0; i < count; i++) {

                color.setHSL((positions1.getY(i) / radius + 1) / 2, 1.0, 0.5, THREE.SRGBColorSpace);
                colors1.setXYZ(i, color.r, color.g, color.b);

                color.setHSL(0, (positions2.getY(i) / radius + 1) / 2, 0.5, THREE.SRGBColorSpace);
                colors2.setXYZ(i, color.r, color.g, color.b);

                color.setRGB(1, 0.8 - (positions3.getY(i) / radius + 1) / 2, 0, THREE.SRGBColorSpace);
                colors3.setXYZ(i, color.r, color.g, color.b);

            }

            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                flatShading: true,
                vertexColors: true,
                shininess: 0
            });

            const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true });

            let mesh = new THREE.Mesh(geometry1, material);
            let wireframe = new THREE.Mesh(geometry1, wireframeMaterial);
            mesh.add(wireframe);
            mesh.position.x = - 400;
            mesh.rotation.x = - 1.87;
            scene.add(mesh);

            mesh = new THREE.Mesh(geometry2, material);
            wireframe = new THREE.Mesh(geometry2, wireframeMaterial);
            mesh.add(wireframe);
            mesh.position.x = 400;
            scene.add(mesh);

            mesh = new THREE.Mesh(geometry3, material);
            wireframe = new THREE.Mesh(geometry3, wireframeMaterial);
            mesh.add(wireframe);
            scene.add(mesh);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height);
            renderer.setAnimationLoop(animate);
            container.appendChild(renderer.domElement);

            container.addEventListener('resize', onWindowResize);

        }

        function onWindowResize() {

            let { width, height } = this.getBoundingClientRect();

            windowHalfX = width / 2;
            windowHalfY = height / 2;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);

        }

        function animate() {
            render();
        }

        // 相机围绕球体旋转的半径  
        const radius = 1000;
        // 相机围绕球体旋转的当前角度（弧度）  
        let angle = 0;

        function render() {
            // requestAnimationFrame(render);
            angle += 0.01; // 控制旋转速度  
            camera.position.x = Math.cos(angle) * radius; // X坐标根据角度变化  
            camera.position.y = Math.sin(angle) * radius; // Y坐标也根据角度变化  
            camera.position.z = 5; // Z坐标保持不变，因为我们是在Z轴方向上“围绕”  
          
            // 让相机看向原点  
            camera.lookAt(0, 0, 0);  

            // 渲染场景  
            renderer.render(scene, camera);
        }

    }

    static get styles() {
        return css`
      :host{
        display: block;
      }
    `
    }
}

window.customElements.define('ys-icons-hello', MyElement)