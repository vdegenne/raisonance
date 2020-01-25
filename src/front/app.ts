import '@material/mwc-button';

import {css, customElement, html, LitElement, property} from 'lit-element';

import {globalStyles} from './global-styles';


@customElement('app-container')
export class AppContainer extends LitElement {
  @property({attribute: false})
  protected state: 'stopped'|'recording' = 'stopped';
  @property({attribute: false}) protected mediaRecorder: MediaRecorder;
  @property({attribute: false}) protected playbackInterval: NodeJS.Timeout;
  @property({attribute: false}) protected audio: HTMLAudioElement;

  constructor() {
    super();
    // @ts-ignore
    window.app = this;
  }

  public static styles = [
    globalStyles,
    css`
    :host {
      display: block;
      --mdc-theme-primary: red;
      padding: 10px;
    }
    `
  ];

  protected render() {
    return html`
    <pre style="line-height:20px">
    Instructions:
      - click the record button.
      - talk.
      - click stop.
      - type the frequency at which you wish the record to play every x seconds.
    </pre>
    <div style="padding-left:50px;">
    <mwc-button @click=${() => this.toggleRecording()} unelevated>
      ${this.state === 'stopped' ? 'record' : 'stop'}
    </mwc-button>
    </div>
    `;
  }

  protected async toggleRecording() {
    if (this.state === 'stopped') {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      const audioChunks: BlobPart[] = [];

      this.mediaRecorder.addEventListener('dataavailable', (event: any) => {
        audioChunks.push(event.data);
      });

      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        this.audio = new Audio(audioUrl);
      });

      this.state = 'recording';

    } else {  // when stopping
      this.mediaRecorder.stop();

      const every = prompt('play every (seconds)', '10');

      if (every === null) {
        return;
      }

      this.playbackInterval = setInterval(() => {
        this.audio.play();
      }, parseInt(every) * 1000);

      setTimeout(() => this.audio.play(), 500);

      this.state = 'stopped';
    }
  }
};