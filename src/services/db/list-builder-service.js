import List from "../../models/list-builder-model.js";


export async function createList(name, recipients, createdBy) {
    try {
         const newList = new List({
            name,
            recipients,
            createdBy,
        });
    
        await newList.save();
        return newList;
    } catch (error) {
        console.error("Error in listBuilderService.createList ", error);
        throw error;
    }
}

export async function getListByUserId(userId) {
    try {
         const listBuilders = await List.find({ createdBy: userId });
         return listBuilders;
    } catch (error) {
        console.error("Error in listBuilderService.getListByUserId ", error);
        throw error;
    }
}

export async function getListByIdAndUserId(listId, userId) {
    try {
        const list = await List.findOne({
            _id: listId,
            createdBy: userId
        })
        return list;
    } catch (error) {
        console.error("Error in listBuilderService.getListByIdAndUserId ", error);
        throw error;
    }
}