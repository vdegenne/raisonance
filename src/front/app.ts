import {css, customElement, html, LitElement, property} from 'lit-element';
import {globalStyles} from './global-styles';

@customElement('app-container')
export class AppContainer extends LitElement {
  @property() protected name = 'my app';

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
    }
    `
  ];

  protected firstUpdated() {
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
    });
  }

  protected render() {
    return html`<div>Welcome on ${this.name}</div>`;
  }
};