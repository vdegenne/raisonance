import { LitElement, html, nothing, css } from 'lit'
import { customElement, queryAll, state } from 'lit/decorators.js'
import '@material/mwc-button';
import './DataManager'
import { DataManager } from './DataManager';
import { Collection, Voice } from './types';
import './AudiosManager'
import './audio-recorder'
import './voice-strip'
import { VoiceStrip } from './voice-strip';

declare global {
  interface Window {
    app: AppContainer;
  }
}


@customElement('app-container')
export class AppContainer extends LitElement {
  @state()
  private collection?: Collection;

  // private dataManager: DataManager;

  @queryAll('voice-strip') voiceStrips!: VoiceStrip[];

  constructor () {
    super()
    window.app = this;
    // window.dataManager = this.dataManager = new DataManager;

    window.addEventListener('hashchange', () => {
      this.voiceStrips.forEach(strip => strip.stop())
      this.processLocation()
    })
  }

  static styles = css`
  .collection {
    background-color: orange;
    color: white;
    padding: 6px;
    margin: 5px;
    cursor: pointer;
  }
  `

  render() {
    if (this.collection) {
      const c = this.collection
      window.location.hash = `c=${c.name}`
      return html`
      <header style="padding:10px;background-color:grey">${c.name}</header>

      <mwc-button outlined icon="loop"
        @click=${() => this.onLoopButtonClick()}>loop</mwc-button>
      ${c.voices.map(v => {
        return html`
        <voice-strip .voice=${v}></voice-strip>
        `
      })}
      <div style="text-align:center">
        <mwc-button unelevated icon="add"
          @click=${() => this.onAddSpeechClick()}>add speech</mwc-button>
      </div>
      `
    }

    const collections = window.dataManager.collections;
    if (collections === undefined) return nothing;

    return html`
    ${collections.map(c => {
      return html`
      <div class="collection"
        @click=${() => this.navigateTo(c)}>${c.name}</div>`
    })}
    `
  }

  private _playingLoop = false
  private async onLoopButtonClick() {
    if (!this._playingLoop) {
      this._playingLoop = true
      while (this._playingLoop) {
        // Picking a random voice strip
        console.log(this.voiceStrips)
        const strip = this.voiceStrips[Math.floor(Math.random() * this.voiceStrips.length)]
        await strip.play()
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
    else {
      this._playingLoop = false
    }
  }

  public async editSpeech (voice: Voice) {
    try {
      await window.audioRecorder.open(voice)
      // Save the informations remotely
      window.dataManager.saveRemote()
      // We also need to save the file if there is a record
      if (window.audioRecorder.blob)
        await window.audiosManager.sendVoiceAudio(voice, window.audioRecorder.blob)
      window.audiosManager.loadVoice(voice)
    }
    catch (e) {
      throw e
    }
    // this.requestUpdate()
  }

  private async onAddSpeechClick() {
    // Construct a new speech
    // Or reuse if there is one in the recorder form
    let voice
    if (window.audioRecorder.voice) {
      voice = window.dataManager.addVoice(this.collection!, window.audioRecorder.voice)
    }
    else {
      voice = window.dataManager.addVoice(this.collection!)
    }

    try {
      await this.editSpeech(voice)
      window.audioRecorder.reset()
      this.requestUpdate()
    }
    catch (e) {
      window.dataManager.removeVoice(voice)
    }
  }

  public processLocation() {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    if (!params.has('c')) {
      if (this.collection) {
        // If we leave the collection we have to stop all the voices
        // this.voiceStrips.forEach(strip => strip.stop())
      }
      this.collection = undefined
    }
    else {
      this.collection = window.dataManager.getCollection(params.get('c')!)
    }
  }

  private navigateTo(c: Collection) {
    this.collection = c;
  }
}