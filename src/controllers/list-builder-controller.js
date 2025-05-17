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
        res.status(200).json({ success: true, message: "User's List Builder", listBuilders})
    } catch (error) {
        console.error("Error getting list builder: ", error);
        res.status(500).json({ success: false, message: "Something went wrong during fetching list builders"})
    }
}