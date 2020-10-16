import { Field, InterfaceType } from 'type-graphql'

@InterfaceType({
    resolveType: (args: Event) => args.eventType,
})
export abstract class Event {
    @Field(() => Date)
    public readonly timestamp: Date

    @Field(() => String)
    public readonly source: string

    @Field(() => String, { name: 'type' })
    public readonly eventType: string

    protected constructor(eventType: string, source?: string) {
        this.timestamp = new Date()
        this.source = source || eventType
        this.eventType = eventType
    }
}
