import { Field, InterfaceType } from 'type-graphql'

export interface IEvent {
    readonly eventType: Required<string>
    readonly timestamp: Required<Date>
}

@InterfaceType({
    resolveType: (args: Event) => args.eventType,
})
export abstract class Event implements IEvent {
    @Field(() => Date)
    public readonly timestamp: Required<Date>

    @Field(() => String, { name: 'type' })
    public readonly eventType: Required<string>

    protected constructor(eventType: Required<string>, timestamp?: Date) {
        this.eventType = eventType
        this.timestamp = timestamp || new Date()
    }
}
