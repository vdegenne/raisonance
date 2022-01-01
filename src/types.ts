export type Voice = {
  id: number;
  title: string;
}

export type Collection = {
  name: string;
  voices: Voice[]
}

export type DataType = Collection[];