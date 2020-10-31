import jsonfile from 'jsonfile'

export class MockDaoMock<DBType = any> {
    private readonly dbFilePath = 'src/daos/MockDb/MockDb.json'

    protected openDb(): Promise<any> {
        return jsonfile.readFile(this.dbFilePath)
    }

    protected saveDb(db: any): Promise<void> {
        return jsonfile.writeFile(this.dbFilePath, db)
    }

    protected async db(): Promise<DBType> {
        return (await this.openDb()) as DBType
    }
}
