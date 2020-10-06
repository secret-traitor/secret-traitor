import { Field, InterfaceType } from 'type-graphql'

@InterfaceType({
    resolveType: (args: Event) => {
        console.log('Event resolveType', args)
        return args.type
    },
})
export abstract class Event {
    @Field(() => Date)
    readonly timestamp: Date

    @Field(() => String)
    readonly source: string

    readonly type: string

    protected constructor(type: string, source?: string) {
        this.timestamp = new Date()
        this.source = source || type
        this.type = type
    }
}
