export enum Topics {
    Play = 'PLAY',
}

export const getTopicName = (topic: Topics, ...args: any[]) =>
    [topic, args.join('|')].join(':')

// TODO: try using literals
// Play: () => (gameId: string) => `PLAY:${gameId}`,
