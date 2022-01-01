import { LitElement, html, css, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js'
import { Dialog } from '@material/mwc-dialog';
import '@material/mwc-dialog'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import '@material/mwc-textfield'
import { Voice } from './types';
import { TextField } from '@material/mwc-textfield';

declare global {
  interface Window {
    audioRecorder: AudioRecorder;
  }
}

@customElement('audio-recorder')
export class AudioRecorder extends LitElement {
  @state()
  private recording = false;
  @state()
  public voice?: Voice;
  @state()
  private audioUrl?: string;

  private _resolve?: (value: unknown) => void;
  private _reject?: (reason?: any) => void;

  private _stream?: MediaStream;
  private _mediaRecorder?: MediaRecorder;
  private _blob?: Blob;

  @query('mwc-dialog') dialog!: Dialog;
  @query('mwc-textfield[label=title]') titleField!: TextField;

  static styles = css`
  mwc-textfield {
    width: 100%;
  }
  `

  render() {
    return html`
    <mwc-dialog heading="Record voice" escapeKeyAction="" scrimClickAction="">
      <mwc-textfield label="title" value=${live(this.voice?.title!)}
        @click=${(e) => { if (e.target.value === 'Untitled Audio') e.target.select() }}></mwc-textfield>

      <div style="text-align:center">
        <mwc-icon-button icon=${!this.recording ? 'mic' : 'fiber_manual_record'}
          style="color:${!this.recording ? 'black' : 'red'};--mdc-icon-size:44px;--mdc-icon-button-size:72px;margin:24px;"
          @click=${() => this.toggleRecording()}></mwc-icon-button>

        ${this.audioUrl ? html`
        <audio src=${this.audioUrl} controls style="display:block;margin-top:18px"></audio>
        ` : nothing}
      </div>

      <mwc-button outlined slot="secondaryAction"
        @click=${() => this.onDialogDismiss()}>cancel</mwc-button>
      <mwc-button unelevated slot="primaryAction"
        ?disabled=${!this.audioUrl}
        @click=${() => this.onDialogAccept()}>save</mwc-button>
    </mwc-dialog>
    `
  }

  private async onDialogDismiss() {
    // Reset before closing
    this.dialog.close()
    this._reject!()
    // this.reset()
    // await new Promise(resolve => setTimeout(resolve, 500))
    if (this._mediaRecorder && this._mediaRecorder.state === 'recording') {
      this._mediaRecorder.stop()
    }
  }

  private onDialogAccept() {
    // We should send the file to the back
    this.voice!.title = this.titleField.value;
    this.dialog.close()
    this._resolve!(this.voice)
  }

  private async toggleRecording() {
    if (!this.recording) {
      // Initialize stream and recorder for the first time
      if (this._stream === undefined || this._mediaRecorder === undefined) {
        this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this._mediaRecorder = new MediaRecorder(this._stream)
      }

      const audioChunks: BlobPart[] = [];
      // On recorder start
      this._mediaRecorder.addEventListener('dataavailable', function (e) {
        audioChunks.push(e.data)
      })
      // On recorder stop
      this._mediaRecorder.addEventListener('stop', () => {
        this.recording = false;
        if (!this.dialog.open) {
          return
        }
        this._blob = new Blob(audioChunks)
        this.audioUrl = URL.createObjectURL(this._blob);
      })

      this._mediaRecorder.start()
      this.recording = true;
    }
    else {
      this._mediaRecorder!.stop()
    }
  }

  public open (voice: Voice) {
    this.voice = voice;
    // Trying to find the audio
    const audio = window.audiosManager.getVoiceAudio(voice)
    audio && (this.audioUrl = audio.src)
    // audioUrl && (this.audioUrl = audioUrl);
    this.dialog.show()
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    })
  }

  public reset() {
    this._blob = undefined;
    this.audioUrl = undefined;
    this.voice = undefined;
  }


  public get blob () {
    return this._blob;
  }
}