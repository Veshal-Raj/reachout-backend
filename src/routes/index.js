import { Router } from "express";
import { authMiddleware } from "../middlewares/auth/auth.js";
import * as listBuilderController from "../controllers/list-builder-controller.js"
import * as emailTemplateController from "../controllers/email-template-controller.js"
import * as campaignController from "../controllers/campaign-controller.js"
import * as userController from "../controllers/user-controller.js"

const router = Router();

router.post("/save-sender-credentials", authMiddleware, userController.saveSenderCredentials);

router.get("/list-builder/:listId", authMiddleware, listBuilderController.getListById);
router.get("/list-builder", authMiddleware, listBuilderController.getList);
router.get("/lists", authMiddleware, listBuilderController.getPaginatedLists);
router.post("/upload-excel", authMiddleware, listBuilderController.uploadExcel);

router.get("/email-template/:templateId", authMiddleware, emailTemplateController.getEmailTemplateById);
router.get("/email-template", authMiddleware, emailTemplateController.getEmailTemplates);
router.get("/templates", authMiddleware, emailTemplateController.getPaginatedTemplates);
router.post("/email-template", authMiddleware, emailTemplateController.createEmailTemplate);

router.post("/send-campaign", authMiddleware, campaignController.sendCampaign);
 
export default router;