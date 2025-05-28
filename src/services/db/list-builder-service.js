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
        if (!list) throw new Error("List not found");
        return list;
    } catch (error) {
        console.error("Error in listBuilderService.getListByIdAndUserId ", error);
        throw error;
    }
}

export async function getPaginatedLists(userId, searchQuery, page, limit, skip) {
    try {

        const filter = {
            createdBy: userId,
            name: { $regex: searchQuery, $options: "i" }
        }

        const [lists, total] = await Promise.all([
            List.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            
            List.countDocuments(filter)
        ])

        const totalPages = Math.ceil(total/limit);

        return {
            currentPage: page,
            totalPages,
            totalItems: total,
            items: lists
        }
    } catch (error) {
        console.error("Error in listBuilderService.getPaginatedLists ", error);
        throw error;
    }
}

export async function deleteListById(listId) {
    try {
        const response = await List.findByIdAndDelete(listId);
        if (!response) throw new Error("List deletion failed");
        return response;
    } catch (error) {
        console.error("Error in listBuilderService.deleteListById ", error);
        throw error;
    }
}