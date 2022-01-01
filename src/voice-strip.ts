import { Voice } from './types';
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('voice-strip')
export class VoiceStrip extends LitElement {
  @state()
  private _playing = false;

  @property({ type: Object })
  private voice?: Voice;

  static styles = css`
  :host {
    display: flex;
    align-items: center;
    background-color: #e0e0e0;
    padding: 6px;
    margin: 5px;
    border-radius: 30px;
  }
  `

  render () {
    if (!this.voice) return nothing;

    return html`
    <mwc-icon-button icon=${!this._playing ? 'play_arrow' : 'stop'}
      @click=${() => this.togglePlay()}></mwc-icon-button>
    <span style="padding-left:12px;flex:1;">${this.voice?.title}</span>
    <mwc-icon-button icon="edit"
      @click=${() => this.onEditClick()}></mwc-icon-button>
    <mwc-icon-button icon="delete"
      @click=${() => this.onDeleteClick()}></mwc-icon-button>
    `
  }

  private async onEditClick() {
    try {
      await window.app.editSpeech(this.voice!)
      this.requestUpdate()
    }
    catch (e) {

    }
  }

  private onDeleteClick() {
    const confirmed = confirm('Are you sure?')
    if (confirmed) {
      window.dataManager.removeVoice(this.voice!)
      window.dataManager.saveRemote()
      // Needa delete the remote audio file as well
      window.audiosManager.removeVoiceAudio(this.voice!)
      window.app.requestUpdate()
    }
  }

  protected updated(_changedProperties: Map<string | number | symbol, unknown>): void {
      // this.audio.onended = () => {
      //   this.stop()
      // }
  }

  private togglePlay() {
    if (!this._playing) {
      this.play()
    }
    else {
      this.stop()
    }
  }

  public play () {
    this.audio.play()
    this._playing = true

    return new Promise(resolve => {
      this.audio.onended = () => {
        this.stop()
        resolve(null)
      }
    })
  }
  public stop () {
    this.audio.pause()
    this.audio.currentTime = 0
    this._playing = false
  }

  get audio () {
    return window.audiosManager.getVoiceAudio(this.voice!)
  }
}