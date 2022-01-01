import { Collection, DataType, Voice } from './types';

declare global {
  interface Window {
    dataManager: DataManager;
  }
}

export class DataManager {
  private data?: DataType = [];

  constructor () {
    this.fetchData()
  }

  /* Adders */
  public addVoice (collection: Collection, voice?: Voice) {
    if (!voice) {
      voice = {
        id: this.nextId,
        title: 'Untitled Audio'
      }
    }
    collection.voices.push(voice)
    return voice;
  }

  /* Removers */
  public removeVoice (voice: Voice) {
    const collection = this.getVoiceCollection(voice)!
    const index = collection.voices.indexOf(voice)
    collection.voices.splice(index, 1)
  }

  /* Getters */
  public get collections () { return this.data }

  public getCollection (name: string) {
    if (!this.data) return undefined
    return this.data.find(c => c.name === name)
  }

  public get voices () {
    return this.collections!.map(c => c.voices).reduce(function (a, b) {
      return a.concat(b)
    })
  }

  public getVoiceCollection (voice: Voice) {
    return this.data?.find(c => c.voices.indexOf(voice) >= 0)
  }

  public get nextId () {
    const ids = this.voices.map(v => v.id)
    let id = 0
    while (ids.indexOf(id) >= 0)
      id++
    return id;
  }

  private async fetchData () {
    const response = await fetch('./data.json')
    this.data = await response.json()
    window.app.requestUpdate()
    window.app.processLocation()
    window.audiosManager.loadAudios()
  }

  public  async saveRemote () {
    const response = await fetch('/data', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(this.data)
    })
  }
}

window.dataManager = new DataManager
