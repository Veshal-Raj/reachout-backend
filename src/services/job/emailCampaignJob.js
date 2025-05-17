import agenda from "./agenda.js";
import { startAutomation } from "../email/automation.js";


agenda.define("send email campaign", async (job, done) => {
    const { list, template } = job.attrs.data;
    try {
        await startAutomation(list, template, new Date());
        done();
    } catch (error) {
        console.error("Error running email campaign job:", error);
        done(error);
    }
})