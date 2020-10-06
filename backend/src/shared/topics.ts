export enum Topics {
    Play = 'PLAY',
}

export const getTopicName = (topic: Topics, ...args: any[]) =>
    [topic, args.join('|')].join(':')
