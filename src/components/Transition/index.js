/* global window */

import React, { Component } from "react"
import { withPrefix } from "gatsby"
import PropTypes from "prop-types"
import * as THREE from "three"
import anime from "animejs"

const vert = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const frag = `
    varying vec2 vUv;
    uniform float dispFactor;
    uniform sampler2D disp;
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform vec2 dispRatio;
    uniform vec2 texture1Ratio;
    uniform vec2 texture2Ratio;
    uniform float angle1;
    uniform float angle2;
    uniform float intensity1;
    uniform float intensity2;
    mat2 getRotM(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
    }
    void main() {
        vec2 centerDisp = vec2((dispRatio.x / 2.0) - 0.5, (dispRatio.y / 2.0) - 0.5);
        vec4 disp = texture2D(disp, (vUv * dispRatio) - centerDisp);
        vec2 dispVec = vec2(disp.r, disp.g);

        vec2 distortedPosition1 = vUv + getRotM(angle1) * dispVec * intensity1 * dispFactor;
        vec2 center1 = vec2((texture1Ratio.x / 2.0) - 0.5, (texture1Ratio.y / 2.0) - 0.5);
        vec4 _texture1 = texture2D(texture1, (distortedPosition1 * texture1Ratio) - center1);
        
        vec2 distortedPosition2 = vUv + getRotM(angle2) * dispVec * intensity2 * (1.0 - dispFactor);
        vec2 center2 = vec2((texture2Ratio.x / 2.0) - 0.5, (texture2Ratio.y / 2.0) - 0.5);
        vec4 _texture2 = texture2D(texture2, (distortedPosition2 * texture2Ratio) - center2);
        gl_FragColor = mix(_texture1, _texture2, dispFactor);
    }
`

class Transition extends Component {
  // States
  static A = 0

  static B = 1

  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    imageA: PropTypes.string,
    imageB: PropTypes.string,
    displacementImage: PropTypes.string.isRequired,
    intensityA: PropTypes.number,
    intensityB: PropTypes.number,
    angleA: PropTypes.number,
    angleB: PropTypes.number,
    speedIn: PropTypes.number,
    speedOut: PropTypes.number,
    easing: PropTypes.string,
    onReady: PropTypes.func,
  }

  static defaultProps = {
    imageA: null,
    imageB: null,
    intensityA: 0.6,
    intensityB: 0.6,
    angleA: Math.PI / 4,
    angleB: -(Math.PI / 4) * 3,
    speedIn: 1,
    speedOut: 1,
    easing: "easeOutExpo",
    onReady: () => false,
  }

  textureCache = {}

  resolvers = {}

  constructor(props) {
    super(props)

    this.mount = React.createRef()
  }

  componentDidMount() {
    const {
      width,
      height,
      imageA,
      imageB,
      displacementImage,
      intensityA,
      intensityB,
      angleA,
      angleB,
      onReady,
    } = this.props

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000,
    )
    this.camera.position.z = 1

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setClearColor(0xffffff, 0.0)
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.mount.current.appendChild(this.renderer.domElement)

    this.textureLoader = new THREE.TextureLoader()
    this.textureLoader.crossOrigin = ""

    this.transparent = withPrefix("assets/transparent.png")
    this.loadTexture(this.transparent, () => {
      this.textureA = imageA
        ? this.loadTexture(imageA)
        : this.textureCache[this.transparent]
      this.textureB = imageB
        ? this.loadTexture(imageB)
        : this.textureCache[this.transparent]

      onReady()
    })
    this.disp = this.loadTexture(displacementImage)

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        intensity1: {
          type: "f",
          value: intensityA,
        },
        intensity2: {
          type: "f",
          value: intensityB,
        },
        dispFactor: {
          type: "f",
          value: 0.0,
        },
        angle1: {
          type: "f",
          value: angleA,
        },
        angle2: {
          type: "f",
          value: angleB,
        },
        texture1: {
          type: "t",
          value: this.textureA,
        },
        texture1Ratio: {
          type: "v2",
          value: [1.0, 1.0],
        },
        texture2: {
          type: "t",
          value: this.textureB,
        },
        texture2Ratio: {
          type: "v2",
          value: [1.0, 1.0],
        },
        disp: {
          type: "t",
          value: this.disp,
        },
        dispRatio: {
          type: "v2",
          value: [1.0, 1.0],
        },
      },

      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      opacity: 1.0,
    })

    const geometry = new THREE.PlaneBufferGeometry(width, height, 1)
    this.object = new THREE.Mesh(geometry, this.mat)
    // console.log(this.object)
    this.scene.add(this.object)
    this.renderScene()
  }

  componentDidUpdate(prevProps) {
    const {
      width,
      height,
      displacementImage,
    } = this.props

    if (prevProps.displacementImage !== displacementImage) {
      this.disp = this.loadTexture(displacementImage)
      this.mat.uniforms.disp.value = this.disp
    }

    if (prevProps.height !== height || prevProps.width !== width) {
      const { clientWidth, clientHeight } = this.mount.current
      this.renderer.setSize(clientWidth, clientHeight)
      this.camera = new THREE.OrthographicCamera(
        clientWidth / -2,
        clientWidth / 2,
        clientHeight / 2,
        clientHeight / -2,
        1,
        1000,
      )
      this.camera.position.z = 1
      this.scene.remove(this.object)
      const geometry = new THREE.PlaneBufferGeometry(width, height, 1)
      this.object = new THREE.Mesh(geometry, this.mat)
      this.scene.add(this.object)
    }

    this.renderScene()
  }

  componentWillUnmount() {
    this.mount.current.removeChild(this.renderer.domElement)
  }

  setImages = (a, b) => {
    const done = new Promise((resolve) => {
      this.setImagesResolver = () => {
        resolve()
        this.setImagesResolver = null
      }
    })

    this.textureASrc = a || this.transparent
    this.textureBSrc = b || this.transparent

    this.loadTexture(this.textureASrc)
    this.loadTexture(this.textureBSrc)

    return done
  }

  animateTo = (state) => {
    const { speedIn, speedOut, easing } = this.props

    if (this.animation) {
      this.animation.pause()
    }

    let done

    if (state === Transition.B) {
      this.animation = anime({
        targets: this.mat.uniforms.dispFactor,
        value: 1,
        duration: speedIn * 1000,
        easing,
        update: this.renderScene,
        complete: () => {
          this.animation = null
          done()
        },
      })
    } else if (state === Transition.A) {
      this.animation = anime({
        targets: this.mat.uniforms.dispFactor,
        value: 0,
        duration: speedOut * 1000,
        easing,
        update: this.renderScene,
        complete: () => {
          this.animation = null
          done()
        },
      })
    }

    return new Promise((resolve) => {
      done = () => {
        resolve()
      }
    })
  }

  loadTexture = (src, done) => {
    if (this.textureCache[src]) {
      this.loadedTexture()
      return this.textureCache[src]
    }

    return this.textureLoader.load(
      src,
      (tex) => {
        this.textureCache[src] = tex

        this.loadedTexture()
        if (done) {
          done()
        }
      },
    )
  }

  setMatRatios = () => {
    const { height, width } = this.props;

    [
      ["texture1", this.textureA],
      ["texture2", this.textureB],
      ["disp", this.disp],
    ].forEach(([uniform, tex]) => {
      /* eslint-disable no-param-reassign */
      tex.wrapS = THREE.ClampToEdgeWrapping
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter

      let ratio = [1.0, 1.0]
      if (height / width > tex.image.height / tex.image.width) {
        const repeatX = (width * tex.image.height) / (height * tex.image.width)
        tex.repeat.set(repeatX, 1)
        ratio = [repeatX, 1.0]
      } else {
        const repeatY = (height * tex.image.width) / (width * tex.image.height)
        tex.repeat.set(1, repeatY)
        ratio = [1.0, repeatY]
      }

      this.mat.uniforms[`${uniform}Ratio`].value = ratio
    })
  }

  loadedTexture = () => {
    if (this.textureCache[this.textureASrc]
      && this.textureCache[this.textureBSrc]
    ) {
      this.textureA = this.textureCache[this.textureASrc]
      this.textureB = this.textureCache[this.textureBSrc]
      this.setMatRatios()

      this.mat.uniforms.dispFactor.value = 0
      this.mat.uniforms.texture1.value = this.textureA
      this.mat.uniforms.texture2.value = this.textureB
      this.renderScene()

      if (this.setImagesResolver) {
        this.setImagesResolver()
      }
    }

    this.renderScene()
    /* eslint-enable no-param-reassign */
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    const { width, height } = this.props

    return (
      <div
        key="transition"
        style={{ width, height }}
        ref={this.mount}
      />
    )
  }
}

export default Transition
