import { Router } from "express";
import { authMiddleware } from "../middlewares/auth/auth.js";
import * as listBuilderController from "../controllers/list-builder-controller.js"
import * as emailTemplateController from "../controllers/email-template-controller.js"
import * as campaignController from "../controllers/campaign-controller.js"

const router = Router();

router.get("/list-builder", authMiddleware, listBuilderController.getList);
router.post("/upload-excel", authMiddleware, listBuilderController.uploadExcel)

router.get("/email-template", authMiddleware, emailTemplateController.getEmailTemplates);
router.post("/email-template", authMiddleware, emailTemplateController.createEmailTemplate);

router.post("/send-campaign", authMiddleware, campaignController.sendCampaign)
 
export default router;