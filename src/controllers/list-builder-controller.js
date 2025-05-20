import * as listBuilderService from "../services/db/list-builder-service.js"

export async function uploadExcel(req, res, next) {
    const { listName, data } = req.body;
  
    if (!listName || !data || data.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid data or missing required fields' });
    }
  
  
    // Process the data (this is just a sample, adapt to your actual logic)
    try {
      // Simulate saving data to database or processing it
        await listBuilderService.createList(listName, data, req?.user?._id);
        res.status(200).json({
            success: true,
            message: 'List uploaded successfully',
            listName,
            totalContacts: data.length,
          });
    } catch (error) {
      console.error('Error processing the request:', error);
      res.status(500).json({ message: 'Something went wrong during upload' });
    }
}

export async function getList(req, res, next) {
    try {
        const userId = req.user._id;
        const listBuilders = await listBuilderService.getListByUserId(userId);
        res.status(200).json({ success: true, message: "User's List Builder Successfully ", listBuilders});
    } catch (error) {
        console.error("Error getting list builder: ", error);
        res.status(500).json({ success: false, message: "Something went wrong during fetching list builders"});
    }
}

export async function getListById(req, res, next) {
  try {
      const userId = req.user._id;
      const { listId } = req.params;
      const list = await listBuilderService.getListByIdAndUserId(userId, listId);
      res.status(200).json({ success: true, message: "List fetched Successfully ", list}); 
  } catch (error) {
      console.error("Error getting list by Id: ", error);
      res.status(500).json({ success: false, message: "Something went wrong during fetching list by Id"});
  }
}

export async function getPaginatedLists(req, res, next) {
  try { 
      const userId = req.user._id;
      const searchQuery = req.query.searchQuery || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const skip = (page - 1) * limit;

      const listsData = await listBuilderService.getPaginatedLists(userId, searchQuery, page, limit, skip);

      res.status(200).json({ success: true, message: "List Data fetched successfully ", listsData});

  } catch (error) {
      console.error("Error getting list in pagination ", error);
      res.status(500).json({ success: false, message: "Something went wrong during fetching list in pagination"})
  }
}