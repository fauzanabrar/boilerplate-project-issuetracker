class Project {
    constructor(database){
        this.database = database
    }
    async create(newProject){
        const result = await this.database.insertOne(newProject)
        // console.log(`has been inserted`);
        return result
    }
    async read(filter){
        const result = await this.database.find(filter)
        // console.log(` has been read`);
        return result
    }
    async update(id, updatedProject){
        const result = await this.database.updateOne({_id: id}, { $set: updatedProject })
        // console.log(`${id} has been updated`);
        return result
    }
    async delete(id){
        const result = await this.database.deleteOne({_id: id})
        // console.log(`${id} has been deleted`);
        return result
    }
    
}

module.exports = Project