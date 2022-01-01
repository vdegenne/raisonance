import { Voice } from './types';

export type AudioInformations = {
  url: string;
  audio: HTMLAudioElement;
}

declare global {
  interface Window {
    audiosManager: AudiosManager;
  }
}

export class AudiosManager {
  private audios: {[voiceIndex:number]: HTMLAudioElement} = {}

  constructor () {
    window.audiosManager = this;
  }

  public getVoiceAudio (voice: Voice) {
    return this.audios[voice.id]
  }

  public async loadAudios () {
    // Get all ids
    window.dataManager.voices.forEach(v => this.loadVoice(v))
  }

  public async loadVoice (voice: Voice) {
    this.audios[voice.id] = new Audio(`./audios/${voice.id}.wav`)
  }
  public async unloadVoice (voice: Voice) {
    delete this.audios[voice.id]
  }

  public async sendVoiceAudio (voice: Voice, blob: Blob) {
    const formData = new FormData
    formData.append('audio', blob)
    await fetch(`/audio/${voice.id}`, {
      method: 'POST',
      body: formData
    })
  }

  public async removeVoiceAudio (voice: Voice) {
    await fetch(`/audio/${voice.id}`, {
      method: 'DELETE'
    })
    this.unloadVoice(voice)
  }
}

window.audiosManager = new AudiosManager