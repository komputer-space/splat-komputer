import * as THREE from "three";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";

import { InfoLayer } from "./InfoLayer";
import { FileImporter } from "./FileImporter";

export class SplatKomputer {
  constructor(canvas) {
    this.transparencyMode = false;
    this.freeze = false;

    this.exampleIndex = 0;
    this.examples = ["garten", "atelier", "baum", "turm", "zimmer"];

    this.importer = new FileImporter(this);

    this.infoLayer = new InfoLayer();

    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 20, 20);
    this.camera.lookAt(0, 3, 0);

    this.splatViewer = new GaussianSplats3D.Viewer({
      camera: this.camera,
      sharedMemoryForWorkers: false,
      renderer: this.renderer,
    });
    this.splatViewer
      .addSplatScene("/examples/garten.ply", {
        splatAlphaRemovalThreshold: 5,
        showLoadingUI: true,
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        progressiveLoad: true,
      })
      .then(() => {
        this.splatViewer.start();
        this.updateView();
      });

    console.log(this.splatViewer);
  }

  // --- CORE METHODS

  update() {}

  resize(width, height) {
    // this.camera.aspect = width / height;
    // this.camera.updateProjectionMatrix();
    // this.renderer.setSize(width, height);
  }

  setViewMode(value) {
    this.freeze = value;
  }

  loadNewExample() {
    console.log("loading next example");
    this.exampleIndex++;
    if (this.exampleIndex >= this.examples.length) this.exampleIndex = 0;
    const fileName = this.examples[this.exampleIndex];
    this.importSplat("/examples/" + fileName + ".ply");
  }

  setViewMode(value) {
    console.log("set view mode");
  }

  setTransparencyMode(value) {
    console.log("set transparency mode");
    this.transparencyMode = value;
    this.setTransparencyView(value);
  }

  setIdleMode(value) {
    this.splatViewer.perspectiveControls.autoRotate = value;
  }

  // --- CUSTOM METHODS

  setTransparencyView(value) {
    this.splatViewer.splatMesh.material.wireframe = value;
    this.splatViewer.splatMesh.material.blending = value
      ? THREE.CustomBlending
      : THREE.NormalBlending;
  }

  setupTransparencyView() {
    this.splatViewer.splatMesh.material.blendColor = new THREE.Color(0xdddddd);
    this.splatViewer.splatMesh.material.blendEquation = THREE.AddEquation; //default
    this.splatViewer.splatMesh.material.blendSrc = THREE.OneMinusSrcColorFactor; //default
    this.splatViewer.splatMesh.material.blendDst = THREE.ConstantColorFactor; //default
  }

  updateView() {
    this.setupTransparencyView();
    this.setTransparencyView(this.transparencyMode);
  }

  // --- INPUTS

  processSerialData() {
    if (this.serialInput.connected) {
      const input = this.serialInput.serialData;
      console.log(input);
    }
  }

  // --- FILE IMPORTS

  importGlTF(url) {
    this.gltfLoader.load(
      url,
      (gltf) => {
        console.log("loaded gltf");
      },
      undefined,
      function (error) {
        console.log("could not load object");
        console.error(error);
        reject();
      }
    );
  }

  importImage(url) {
    this.textureLoader.load(
      url,
      (texture) => {
        console.log("loaded image");
      },
      undefined,
      function (error) {
        console.log("could not load texture");
        console.error(error);
        reject();
      }
    );
  }

  importSplat(url) {
    // this.splatViewer.removeSplatScene(0);
    console.log(url);
    this.splatViewer.dispose().then(() => {
      console.log("load");
      this.splatViewer = new GaussianSplats3D.Viewer({
        cameraUp: [0, 1, 0],
        camera: this.camera,
        sharedMemoryForWorkers: false,
        renderer: this.renderer,
      });
      this.splatViewer
        .addSplatScene(url, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: true,
          position: [0, 0, 0],
          rotation: [0, 0, 0, 1],
          progressiveLoad: true,
        })
        .then(() => {
          this.splatViewer.start();
          this.updateView();
        });
    });
  }
}
